"use client";

/**
 * RealtimeContext
 *
 * Provides global realtime state driven by blockchain events.
 * Wrap the app root with <RealtimeProvider> and consume via useRealtime().
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from "react";

import {
  startEventListener,
  stopEventListener,
  subscribeToEvents,
  subscribeToStatus,
  shortAddress,
} from "@/lib/event-listener";

import type {
  ContractEvent,
  RealtimeState,
  ActivityEntry,
  LeaderboardEntry,
} from "@/types/events";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FEED_SIZE = 100;

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: RealtimeState = {
  highestBid: null,
  highestBidder: null,
  pollResults: null,
  activityFeed: [],
  leaderboard: [],
  lastLedger: 0,
  isConnected: false,
  lastError: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "EVENTS"; events: ContractEvent[] }
  | { type: "STATUS"; connected: boolean; error: string | null }
  | { type: "BOOTSTRAP"; highestBid: number; pollResults: [number, number] };

function buildActivity(event: ContractEvent): ActivityEntry {
  let kind: ActivityEntry["kind"];
  let label: string;
  let amount: number | undefined;

  if (event.kind === "NEW_BID") {
    kind = "bid";
    amount = event.amount;
    label = `${shortAddress(event.user)} placed a bid of ${event.amount} XLM`;
  } else if (event.kind === "NEW_VOTE") {
    kind = event.voteYes ? "vote_yes" : "vote_no";
    label = `${shortAddress(event.user)} voted ${event.voteYes ? "YES 👍" : "NO 👎"}`;
  } else {
    kind = "payment";
    amount = event.amount;
    label = `${shortAddress(event.user)} tracked payment of ${event.amount} XLM`;
  }

  return {
    id: event.eventId,
    kind,
    user: event.user,
    shortUser: shortAddress(event.user),
    amount,
    timestamp: event.timestamp,
    label,
    ledger: event.ledger,
  };
}

function updateLeaderboard(
  board: LeaderboardEntry[],
  event: ContractEvent
): LeaderboardEntry[] {
  const existing = board.find((e) => e.user === event.user);

  let entry: LeaderboardEntry;
  if (existing) {
    entry = { ...existing };
  } else {
    entry = {
      user: event.user,
      shortUser: shortAddress(event.user),
      score: 0,
      bids: 0,
      votes: 0,
      payments: 0,
      totalVolume: 0,
    };
  }

  if (event.kind === "NEW_BID") {
    entry.bids += 1;
    entry.score += 3; // bids worth 3 points
    entry.totalVolume += event.amount;
  } else if (event.kind === "NEW_VOTE") {
    entry.votes += 1;
    entry.score += 1; // votes worth 1 point
  } else if (event.kind === "PAYMENT") {
    entry.payments += 1;
    entry.score += 2; // payments worth 2 points
    entry.totalVolume += event.amount;
  }

  const others = board.filter((e) => e.user !== event.user);
  return [...others, entry].sort((a, b) => b.score - a.score);
}

function reducer(state: RealtimeState, action: Action): RealtimeState {
  switch (action.type) {
    case "STATUS":
      return {
        ...state,
        isConnected: action.connected,
        lastError: action.error,
      };

    case "BOOTSTRAP":
      return {
        ...state,
        highestBid: action.highestBid,
        pollResults: action.pollResults,
      };

    case "EVENTS": {
      let nextState = { ...state };

      for (const event of action.events) {
        // ── Update per-event kind ────────────────────────────────────────────
        if (event.kind === "NEW_BID") {
          if (
            nextState.highestBid === null ||
            event.amount > nextState.highestBid
          ) {
            nextState.highestBid = event.amount;
            nextState.highestBidder = event.user;
          }
        } else if (event.kind === "NEW_VOTE") {
          const current = nextState.pollResults ?? [0, 0];
          nextState.pollResults = event.voteYes
            ? [current[0] + 1, current[1]]
            : [current[0], current[1] + 1];
        }

        // ── Activity feed (newest first, bounded) ────────────────────────────
        const entry = buildActivity(event);
        nextState.activityFeed = [entry, ...nextState.activityFeed].slice(
          0,
          MAX_FEED_SIZE
        );

        // ── Leaderboard ──────────────────────────────────────────────────────
        nextState.leaderboard = updateLeaderboard(nextState.leaderboard, event);

        // ── Track latest ledger ──────────────────────────────────────────────
        if (event.ledger > nextState.lastLedger) {
          nextState.lastLedger = event.ledger;
        }
      }

      return nextState;
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface RealtimeContextValue extends RealtimeState {
  /** Call after a local write to immediately reflect optimistic updates */
  optimisticBid: (user: string, amount: number) => void;
  optimisticVote: (user: string, voteYes: boolean) => void;
  optimisticPayment: (user: string, amount: number) => void;
  /** Seed contract state from an initial fetch (avoids waiting for next poll) */
  bootstrapState: (highestBid: number, pollResults: [number, number]) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Use a ref so event callbacks always close over latest dispatch
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    // Start polling
    startEventListener();

    const unsubEvents = subscribeToEvents((events: ContractEvent[]) => {
      dispatchRef.current({ type: "EVENTS", events });
    });

    const unsubStatus = subscribeToStatus(
      (connected: boolean, error: string | null) => {
        dispatchRef.current({ type: "STATUS", connected, error });
      }
    );

    return () => {
      unsubEvents();
      unsubStatus();
      stopEventListener();
    };
  }, []);

  const bootstrapState = useCallback(
    (highestBid: number, pollResults: [number, number]) => {
      dispatch({ type: "BOOTSTRAP", highestBid, pollResults });
    },
    []
  );

  /** Inject a synthetic optimistic event immediately after a successful write */
  function optimisticBid(user: string, amount: number) {
    const syntheticEvent: ContractEvent = {
      kind: "NEW_BID",
      user,
      amount,
      timestamp: new Date().toISOString(),
      eventId: `optimistic-bid-${Date.now()}`,
      ledger: state.lastLedger,
    };
    dispatch({ type: "EVENTS", events: [syntheticEvent] });
  }

  function optimisticVote(user: string, voteYes: boolean) {
    const syntheticEvent: ContractEvent = {
      kind: "NEW_VOTE",
      user,
      voteYes,
      timestamp: new Date().toISOString(),
      eventId: `optimistic-vote-${Date.now()}`,
      ledger: state.lastLedger,
    };
    dispatch({ type: "EVENTS", events: [syntheticEvent] });
  }

  function optimisticPayment(user: string, amount: number) {
    const syntheticEvent: ContractEvent = {
      kind: "PAYMENT",
      user,
      amount,
      timestamp: new Date().toISOString(),
      eventId: `optimistic-payment-${Date.now()}`,
      ledger: state.lastLedger,
    };
    dispatch({ type: "EVENTS", events: [syntheticEvent] });
  }

  return (
    <RealtimeContext.Provider
      value={{
        ...state,
        optimisticBid,
        optimisticVote,
        optimisticPayment,
        bootstrapState,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used inside <RealtimeProvider>");
  }
  return ctx;
}
