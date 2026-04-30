// ─── Raw event shapes from Soroban RPC ───────────────────────────────────────

export interface SorobanEventValue {
  type: string;
  value: string;
}

export interface SorobanEvent {
  type: string;
  ledger: number;
  ledgerClosedAt: string;
  contractId: string;
  id: string;
  topic: SorobanEventValue[];
  value: SorobanEventValue;
}

// ─── Normalized / typed domain events ────────────────────────────────────────

export interface BidEvent {
  kind: "NEW_BID";
  user: string;
  amount: number;
  timestamp: string;
  eventId: string;
  ledger: number;
}

export interface VoteEvent {
  kind: "NEW_VOTE";
  user: string;
  voteYes: boolean;
  timestamp: string;
  eventId: string;
  ledger: number;
}

export interface PaymentEvent {
  kind: "PAYMENT";
  user: string;
  amount: number;
  timestamp: string;
  eventId: string;
  ledger: number;
}

/** Discriminated union of all contract events */
export type ContractEvent = BidEvent | VoteEvent | PaymentEvent;

// ─── Activity feed entry ──────────────────────────────────────────────────────

export type ActivityKind = "bid" | "vote_yes" | "vote_no" | "payment";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  user: string;
  /** Human-readable short address e.g. "GABCD…WXYZ" */
  shortUser: string;
  amount?: number;
  timestamp: string;
  label: string;
  ledger: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  user: string;
  shortUser: string;
  score: number;
  bids: number;
  votes: number;
  payments: number;
  totalVolume: number;
}

// ─── Real-time state snapshot ─────────────────────────────────────────────────

export interface RealtimeState {
  highestBid: number | null;
  highestBidder: string | null;
  pollResults: [number, number] | null;
  activityFeed: ActivityEntry[];
  leaderboard: LeaderboardEntry[];
  lastLedger: number;
  isConnected: boolean;
  lastError: string | null;
}
