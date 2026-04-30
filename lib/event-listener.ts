/**
 * event-listener.ts
 *
 * Polls the Soroban RPC for contract events, normalises them into typed domain
 * objects, deduplicates across polls and exposes a subscription interface that
 * the rest of the app can use without knowing about RPC internals.
 *
 * Strategy: Soroban RPC does not push events via WebSocket to browsers; we
 * therefore use a polling approach with an optimised interval and cursor-based
 * pagination so we never re-process already-seen events.
 */

import type {
  ContractEvent,
  BidEvent,
  VoteEvent,
  PaymentEvent,
  SorobanEvent,
} from "@/types/events";

// ─── Constants ────────────────────────────────────────────────────────────────

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-testnet.stellar.org";

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR";

/** How often to poll for new events (ms). 4 s is a good balance between
 *  freshness and RPC rate-limits on testnet. */
const POLL_INTERVAL_MS = 4_000;

/** Maximum back-off interval during repeated failures (ms). */
const MAX_BACKOFF_MS = 60_000;

/** Maximum number of events to fetch per poll. */
const EVENTS_PER_PAGE = 50;

/** Maximum age of the seen-IDs dedup set to prevent unbounded memory growth. */
const MAX_SEEN_IDS = 500;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Converts a Soroban XDR ScVal encoded as base64 into a JS string. */
function decodeScString(encoded: string): string {
  try {
    // The RPC returns the value as {"type":"string","value":"..."} already
    // decoded in JSON format; this helper just extracts it.
    return encoded;
  } catch {
    return encoded;
  }
}

/** Abbreviates a Stellar public key to "GABCD…WXYZ" format. */
export function shortAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── RPC request/response types ───────────────────────────────────────────────

interface RpcGetEventsParams {
  startLedger?: number;
  filters: Array<{
    type: "contract";
    contractIds: string[];
    topics?: string[][];
  }>;
  pagination?: {
    limit: number;
    cursor?: string;
  };
}

interface RpcGetEventsResponse {
  result?: {
    events: SorobanEvent[];
    latestLedger: number;
    cursor?: string;
  };
  error?: { code: number; message: string };
}

// ─── Core RPC call ────────────────────────────────────────────────────────────

async function rpcGetEvents(
  params: RpcGetEventsParams
): Promise<RpcGetEventsResponse> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getEvents",
    params,
  };

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Abort after 10 seconds to prevent indefinite hangs
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<RpcGetEventsResponse>;
}

// ─── Event normalisation ──────────────────────────────────────────────────────

/**
 * Attempts to decode the XDR/JSON value returned by the RPC for a topic or
 * value field.  The Soroban RPC returns objects like:
 *   { "type": "address", "value": "GABC..." }
 *   { "type": "bool",    "value": true }
 *   { "type": "u32",     "value": 42   }
 *   { "type": "sym",     "value": "NEW_BID" }
 */
function extractScVal(raw: string | { type: string; value: unknown }): unknown {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "value" in parsed) {
        return parsed.value;
      }
      return parsed;
    } catch {
      return raw;
    }
  }
  if (raw && typeof raw === "object" && "value" in raw) {
    return raw.value;
  }
  return raw;
}

function normaliseEvent(raw: SorobanEvent): ContractEvent | null {
  try {
    // topic[0] is always the event name / discriminator symbol
    const nameTopic = raw.topic?.[0];
    if (!nameTopic) return null;

    const eventName = String(extractScVal(nameTopic as unknown as string)).toUpperCase();

    const ledger = raw.ledger ?? 0;
    const timestamp = raw.ledgerClosedAt || new Date().toISOString();
    const eventId = raw.id || `${ledger}-${Math.random()}`;

    // ── NEW_BID ──────────────────────────────────────────────────────────────
    if (eventName === "NEW_BID") {
      // topic[1] = user address, value = amount
      const user = String(extractScVal(raw.topic?.[1] as unknown as string) ?? "");
      const amount = Number(extractScVal(raw.value as unknown as string) ?? 0);

      const event: BidEvent = {
        kind: "NEW_BID",
        user,
        amount,
        timestamp,
        eventId,
        ledger,
      };
      return event;
    }

    // ── NEW_VOTE ──────────────────────────────────────────────────────────────
    if (eventName === "NEW_VOTE") {
      const user = String(extractScVal(raw.topic?.[1] as unknown as string) ?? "");
      const voteYes = Boolean(extractScVal(raw.value as unknown as string));

      const event: VoteEvent = {
        kind: "NEW_VOTE",
        user,
        voteYes,
        timestamp,
        eventId,
        ledger,
      };
      return event;
    }

    // ── PAYMENT ───────────────────────────────────────────────────────────────
    if (eventName === "PAYMENT") {
      const user = String(extractScVal(raw.topic?.[1] as unknown as string) ?? "");
      const amount = Number(extractScVal(raw.value as unknown as string) ?? 0);

      const event: PaymentEvent = {
        kind: "PAYMENT",
        user,
        amount,
        timestamp,
        eventId,
        ledger,
      };
      return event;
    }

    return null;
  } catch (err) {
    console.warn("[EventListener] Failed to normalise event:", err, raw);
    return null;
  }
}

// ─── Public Subscription API ──────────────────────────────────────────────────

export type EventCallback = (events: ContractEvent[]) => void;
export type StatusCallback = (connected: boolean, error: string | null) => void;

interface ListenerState {
  timerId: ReturnType<typeof setTimeout> | null;
  startLedger: number;
  cursor: string | undefined;
  seenIds: string[];
  backoffMs: number;
  callbacks: Set<EventCallback>;
  statusCallbacks: Set<StatusCallback>;
  isRunning: boolean;
}

const state: ListenerState = {
  timerId: null,
  startLedger: 0,
  cursor: undefined,
  seenIds: [],
  backoffMs: POLL_INTERVAL_MS,
  callbacks: new Set(),
  statusCallbacks: new Set(),
  isRunning: false,
};

function emitStatus(connected: boolean, error: string | null) {
  state.statusCallbacks.forEach((cb) => {
    try {
      cb(connected, error);
    } catch (e) {
      console.warn("[EventListener] Status callback error:", e);
    }
  });
}

async function pollOnce() {
  try {
    const params: RpcGetEventsParams = {
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
      pagination: { limit: EVENTS_PER_PAGE, cursor: state.cursor },
    };

    // On first poll, anchor to a recent ledger rather than ledger 0
    // to avoid fetching the entire contract history.
    if (!state.cursor && state.startLedger > 0) {
      params.startLedger = state.startLedger;
    }

    const response = await rpcGetEvents(params);

    if (response.error) {
      throw new Error(`RPC error ${response.error.code}: ${response.error.message}`);
    }

    const result = response.result;
    if (!result) return;

    // Advance cursor for next poll
    if (result.cursor) {
      state.cursor = result.cursor;
    } else if (result.events.length > 0) {
      // Use last event ID as next cursor
      state.cursor = result.events[result.events.length - 1].id;
    }

    // Deduplicate
    const newEvents = result.events.filter((e) => {
      if (state.seenIds.includes(e.id)) return false;
      return true;
    });

    if (newEvents.length > 0) {
      // Track seen IDs (bounded set)
      state.seenIds.push(...newEvents.map((e) => e.id));
      if (state.seenIds.length > MAX_SEEN_IDS) {
        state.seenIds = state.seenIds.slice(-MAX_SEEN_IDS);
      }

      const normalised = newEvents
        .map(normaliseEvent)
        .filter((e): e is ContractEvent => e !== null);

      if (normalised.length > 0) {
        state.callbacks.forEach((cb) => {
          try {
            cb(normalised);
          } catch (e) {
            console.warn("[EventListener] Callback error:", e);
          }
        });
      }
    }

    // Reset back-off on success
    state.backoffMs = POLL_INTERVAL_MS;
    emitStatus(true, null);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[EventListener] Poll failed:", message);

    // Exponential back-off
    state.backoffMs = Math.min(state.backoffMs * 2, MAX_BACKOFF_MS);
    emitStatus(false, message);
  }
}

function scheduleNext() {
  if (!state.isRunning) return;
  state.timerId = setTimeout(async () => {
    await pollOnce();
    scheduleNext();
  }, state.backoffMs);
}

/**
 * Fetches the current latest ledger from the RPC so that we don't need to
 * scan from ledger 0 on startup.
 */
async function fetchLatestLedger(): Promise<number> {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getLatestLedger",
        params: {},
      }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = await res.json();
    return Number(data?.result?.sequence ?? 0);
  } catch {
    return 0;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start listening for contract events.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function startEventListener(): Promise<void> {
  if (state.isRunning) return;
  state.isRunning = true;

  // Anchor to a recent ledger — look back at most ~5 minutes of ledgers
  // (Stellar closes a ledger every ~5 seconds → 60 ledgers per 5 min).
  const latest = await fetchLatestLedger();
  state.startLedger = Math.max(1, latest - 60);

  await pollOnce();
  scheduleNext();
}

/**
 * Stop polling and clean up timers.
 */
export function stopEventListener(): void {
  state.isRunning = false;
  if (state.timerId !== null) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

/**
 * Subscribe to normalised contract events.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(callback: EventCallback): () => void {
  state.callbacks.add(callback);
  return () => {
    state.callbacks.delete(callback);
  };
}

/**
 * Subscribe to listener status changes (connected / disconnected + error msg).
 * Returns an unsubscribe function.
 */
export function subscribeToStatus(callback: StatusCallback): () => void {
  state.statusCallbacks.add(callback);
  return () => {
    state.statusCallbacks.delete(callback);
  };
}
