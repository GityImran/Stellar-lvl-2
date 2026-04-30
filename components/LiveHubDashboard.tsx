"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchHighestBid,
  fetchPollResults,
  fetchUserScore,
  submitPlaceBid,
  submitVote,
  submitTrackPayment,
  type UserStats,
} from "@/lib/livehub-client";
import { useRealtime } from "@/lib/realtime-context";
import { WalletData } from "@/types/wallet";
import {
  Gavel,
  Vote,
  CreditCard,
  Trophy,
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Star,
  Activity,
  Zap,
} from "lucide-react";
import { useToast } from "@/lib/toast-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxStatus = "idle" | "pending" | "success" | "failed";

interface TxState {
  status: TxStatus;
  message: string;
  hash?: string;
}

interface LiveHubDashboardProps {
  wallet: WalletData | null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function TxStatusBadge({ state }: { state: TxState }) {
  const configs = {
    idle: {
      icon: Clock,
      label: "Ready",
      cls: "bg-blue-50 border-blue-100 text-blue-400",
    },
    pending: {
      icon: Loader2,
      label: "Pending",
      cls: "bg-amber-100 border-amber-200 text-amber-600",
      spin: true,
    },
    success: {
      icon: CheckCircle2,
      label: "Success",
      cls: "bg-emerald-100 border-emerald-200 text-emerald-600",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      cls: "bg-red-100 border-red-200 text-red-600",
    },
  };

  const cfg = configs[state.status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${cfg.cls}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`w-5 h-5 ${state.status === "pending" ? "animate-spin" : ""}`}
        />
        <span className="text-sm font-black uppercase tracking-wider">
          Transaction {cfg.label}
        </span>
      </div>
      {state.message && (
        <p className="text-xs font-bold opacity-80 leading-relaxed">{state.message}</p>
      )}
      {state.hash && (
        <p className="text-xs font-bold font-mono mt-2 opacity-60 break-all bg-white/50 px-2 py-1 rounded-lg inline-block">
          Hash: {state.hash.slice(0, 16)}…{state.hash.slice(-8)}
        </p>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  color,
  live,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-black text-blue-950 tracking-wide">{title}</h3>
      {live && (
        <div className="ml-auto flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  flash,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  flash?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 flex items-start gap-4 transition-all duration-500 shadow-sm ${
        flash ? "ring-4 ring-indigo-300 bg-indigo-50 border-indigo-200" : "bg-sky-50 border-blue-100"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-6 w-20 rounded-lg bg-blue-200 animate-pulse" />
        ) : (
          <p className="text-xl font-black text-blue-900 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Live Bid Panel ───────────────────────────────────────────────────────────

function LiveBidPanel({ loading }: { loading: boolean }) {
  const { highestBid, highestBidder } = useRealtime();
  const [flash, setFlash] = useState(false);
  const prevBid = useCallback(() => highestBid, [highestBid]);

  useEffect(() => {
    if (highestBid !== null) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [highestBid]);

  return (
    <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
      <SectionHeader
        icon={Gavel}
        title="Highest Bid"
        color="bg-amber-100 border-amber-200 text-amber-500"
        live
      />
      <StatCard
        label="Current Highest Bid"
        value={highestBid !== null ? `${highestBid} XLM` : "—"}
        icon={TrendingUp}
        color="bg-amber-50 border-amber-200 text-amber-500"
        loading={loading && highestBid === null}
        flash={flash}
      />
      {highestBidder && (
        <p className="mt-3 text-xs font-bold font-mono text-blue-400 truncate bg-sky-50 px-3 py-1.5 rounded-xl inline-block border border-sky-100">
          by {highestBidder.slice(0, 8)}…{highestBidder.slice(-8)}
        </p>
      )}
    </div>
  );
}

// ─── Live Poll Panel ──────────────────────────────────────────────────────────

function LivePollPanel({ loading }: { loading: boolean }) {
  const { pollResults } = useRealtime();
  const totalVotes = pollResults ? pollResults[0] + pollResults[1] : 0;
  const yesPercent =
    totalVotes > 0 ? Math.round((pollResults![0] / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? 100 - yesPercent : 0;

  return (
    <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
      <SectionHeader
        icon={BarChart3}
        title="Poll Results"
        color="bg-violet-100 border-violet-200 text-violet-500"
        live
      />
      {loading && !pollResults ? (
        <div className="space-y-3">
          <div className="h-10 bg-blue-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-blue-100 rounded-xl animate-pulse" />
        </div>
      ) : pollResults ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-400 font-bold">Total votes: {totalVotes}</span>
          </div>
          {/* YES */}
          <div>
            <div className="flex justify-between text-sm mb-1.5 font-black">
              <span className="text-emerald-500">YES 👍</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 rounded-md">
                {pollResults[0]} ({yesPercent}%)
              </span>
            </div>
            <div className="h-4 rounded-full bg-emerald-50 overflow-hidden border border-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
          </div>
          {/* NO */}
          <div>
            <div className="flex justify-between text-sm mb-1.5 font-black">
              <span className="text-red-500">NO 👎</span>
              <span className="text-red-600 bg-red-50 px-2 rounded-md">
                {pollResults[1]} ({noPercent}%)
              </span>
            </div>
            <div className="h-4 rounded-full bg-red-50 overflow-hidden border border-red-100">
              <div
                className="h-full rounded-full bg-red-400 transition-all duration-700"
                style={{ width: `${noPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-blue-400 font-bold text-sm">Could not load poll data</p>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function LiveHubDashboard({ wallet }: LiveHubDashboardProps) {
  const {
    optimisticBid,
    optimisticVote,
    optimisticPayment,
    bootstrapState,
  } = useRealtime();

  // ── Write inputs
  const [bidAmount, setBidAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // ── User score (still fetched locally — no on-chain event for it)
  const [userScore, setUserScore] = useState<UserStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // ── Transaction state per action
  const [bidTx, setBidTx] = useState<TxState>({ status: "idle", message: "" });
  const [voteTx, setVoteTx] = useState<TxState>({ status: "idle", message: "" });
  const [paymentTx, setPaymentTx] = useState<TxState>({ status: "idle", message: "" });

  const { showToast } = useToast();

  // ─── Bootstrap contract state on mount ───────────────────────────────────

  const loadInitialState = useCallback(async () => {
    setDataLoading(true);
    try {
      const [bid, poll] = await Promise.all([
        fetchHighestBid(),
        fetchPollResults(),
      ]);
      bootstrapState(bid, poll);

      if (wallet?.address) {
        const score = await fetchUserScore(wallet.address);
        setUserScore(score);
      }
    } catch (err) {
      console.error("Failed to fetch initial contract state:", err);
    } finally {
      setDataLoading(false);
    }
  }, [wallet?.address, bootstrapState]);

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  // ─── Error helpers ────────────────────────────────────────────────────────

  function classifyError(err: unknown): string {
    const msg = String(
      (err as { message?: string })?.message || err || ""
    ).toLowerCase();
    if (!wallet) return "Wallet not connected. Please connect first.";
    if (msg.includes("rejected") || msg.includes("user denied"))
      return "Transaction rejected by user.";
    if (msg.includes("insufficient") || msg.includes("balance"))
      return "Insufficient XLM balance.";
    if (msg.includes("network") || msg.includes("fetch"))
      return "Network error. Check your connection.";
    if (msg.includes("contract"))
      return "Contract execution failed. Check your input values.";
    return (err as { message?: string })?.message || "An unexpected error occurred.";
  }

  // ─── Action: Place Bid ────────────────────────────────────────────────────

  async function handlePlaceBid() {
    if (!wallet) {
      setBidTx({ status: "failed", message: "Wallet not connected." });
      showToast({ type: "error", title: "Error", message: "Wallet not connected." });
      return;
    }
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidTx({ status: "failed", message: "Enter a valid bid amount (positive integer)." });
      showToast({ type: "error", title: "Invalid Input", message: "Bid amount must be a positive integer." });
      return;
    }
    setBidTx({ status: "pending", message: "Signing and submitting bid to Stellar testnet…" });
    showToast({ type: "loading", title: "Placing Bid", message: "Submitting transaction..." });
    try {
      const hash = await submitPlaceBid(wallet.address, amount);
      setBidTx({ status: "success", message: `Bid of ${amount} XLM placed!`, hash });
      showToast({ 
        type: "success", 
        title: "Bid Successful", 
        message: `Placed bid for ${amount} XLM!`,
        link: { url: `https://stellar.expert/explorer/testnet/tx/${hash}`, label: "View on Stellar Expert" }
      });
      setBidAmount("");
      optimisticBid(wallet.address, amount);
    } catch (err) {
      const errMsg = classifyError(err);
      setBidTx({ status: "failed", message: errMsg });
      showToast({ type: "error", title: "Bid Failed", message: errMsg });
    }
  }

  // ─── Action: Vote ─────────────────────────────────────────────────────────

  async function handleVote(voteYes: boolean) {
    if (!wallet) {
      setVoteTx({ status: "failed", message: "Wallet not connected." });
      showToast({ type: "error", title: "Error", message: "Wallet not connected." });
      return;
    }
    setVoteTx({ status: "pending", message: `Submitting ${voteYes ? "YES" : "NO"} vote…` });
    showToast({ type: "loading", title: "Casting Vote", message: "Submitting transaction..." });
    try {
      const hash = await submitVote(wallet.address, voteYes);
      setVoteTx({
        status: "success",
        message: `Vote "${voteYes ? "YES" : "NO"}" recorded!`,
        hash,
      });
      showToast({ 
        type: "success", 
        title: "Vote Successful", 
        message: `Voted ${voteYes ? "YES" : "NO"}!`,
        link: { url: `https://stellar.expert/explorer/testnet/tx/${hash}`, label: "View on Stellar Expert" }
      });
      optimisticVote(wallet.address, voteYes);
    } catch (err) {
      const errMsg = classifyError(err);
      setVoteTx({ status: "failed", message: errMsg });
      showToast({ type: "error", title: "Vote Failed", message: errMsg });
    }
  }

  // ─── Action: Track Payment ────────────────────────────────────────────────

  async function handleTrackPayment() {
    if (!wallet) {
      setPaymentTx({ status: "failed", message: "Wallet not connected." });
      showToast({ type: "error", title: "Error", message: "Wallet not connected." });
      return;
    }
    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentTx({ status: "failed", message: "Enter a valid payment amount." });
      showToast({ type: "error", title: "Invalid Input", message: "Payment amount must be a positive integer." });
      return;
    }
    setPaymentTx({ status: "pending", message: "Recording payment on-chain…" });
    showToast({ type: "loading", title: "Tracking Payment", message: "Submitting transaction..." });
    try {
      const hash = await submitTrackPayment(wallet.address, amount);
      setPaymentTx({ status: "success", message: `Payment of ${amount} XLM tracked!`, hash });
      showToast({ 
        type: "success", 
        title: "Payment Tracked", 
        message: `Tracked payment of ${amount} XLM!`,
        link: { url: `https://stellar.expert/explorer/testnet/tx/${hash}`, label: "View on Stellar Expert" }
      });
      setPaymentAmount("");
      optimisticPayment(wallet.address, amount);
    } catch (err) {
      const errMsg = classifyError(err);
      setPaymentTx({ status: "failed", message: errMsg });
      showToast({ type: "error", title: "Payment Tracking Failed", message: errMsg });
    }
  }

  // ─── Render: not connected ────────────────────────────────────────────────

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-white rounded-3xl border-4 border-blue-200 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border-4 border-blue-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-blue-300" />
        </div>
        <div>
          <p className="text-blue-900 font-black text-lg">
            Connect your wallet to use the dashboard
          </p>
          <p className="text-blue-400 font-bold text-sm mt-1">
            All contract interactions require a connected Stellar wallet
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: main 2-column layout ────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ══ LEFT — Actions ══════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-blue-950">Actions</h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border-2 border-emerald-200 text-emerald-600 text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              Live on Testnet
            </div>
          </div>

          {/* ── Place Bid ── */}
          <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
            <SectionHeader
              icon={Gavel}
              title="Place Bid"
              color="bg-indigo-100 border-indigo-200 text-indigo-500"
            />
            <div className="flex gap-3">
              <input
                id="bid-amount-input"
                type="number"
                min="1"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlaceBid()}
                placeholder="Bid amount (XLM)"
                disabled={bidTx.status === "pending"}
                className="flex-1 bg-sky-50 border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-bold text-blue-900 placeholder-blue-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                id="place-bid-btn"
                onClick={handlePlaceBid}
                disabled={bidTx.status === "pending" || !bidAmount}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-3 rounded-2xl transition-transform active:translate-y-1 border-b-4 border-indigo-700 active:border-b-0 shrink-0"
              >
                {bidTx.status === "pending" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Gavel className="w-5 h-5" />
                )}
                Bid
              </button>
            </div>
            <div className="mt-4">
              <TxStatusBadge state={bidTx} />
            </div>
          </div>

          {/* ── Vote Poll ── */}
          <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
            <SectionHeader
              icon={Vote}
              title="Vote on Poll"
              color="bg-violet-100 border-violet-200 text-violet-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                id="vote-yes-btn"
                onClick={() => handleVote(true)}
                disabled={voteTx.status === "pending"}
                className="flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 border-b-4 border-emerald-300 disabled:border-b-4 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-700 text-sm font-black px-4 py-3.5 rounded-2xl transition-transform active:translate-y-1 active:border-b-0"
              >
                {voteTx.status === "pending" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-xl">👍</span>
                )}
                YES
              </button>
              <button
                id="vote-no-btn"
                onClick={() => handleVote(false)}
                disabled={voteTx.status === "pending"}
                className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 border-b-4 border-red-300 disabled:border-b-4 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 text-sm font-black px-4 py-3.5 rounded-2xl transition-transform active:translate-y-1 active:border-b-0"
              >
                {voteTx.status === "pending" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-xl">👎</span>
                )}
                NO
              </button>
            </div>
            <div className="mt-4">
              <TxStatusBadge state={voteTx} />
            </div>
          </div>

          {/* ── Track Payment ── */}
          <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
            <SectionHeader
              icon={CreditCard}
              title="Track Payment"
              color="bg-sky-100 border-sky-200 text-sky-500"
            />
            <div className="flex gap-3">
              <input
                id="payment-amount-input"
                type="number"
                min="1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrackPayment()}
                placeholder="Payment amount (XLM)"
                disabled={paymentTx.status === "pending"}
                className="flex-1 bg-sky-50 border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-bold text-blue-900 placeholder-blue-300 focus:outline-none focus:border-sky-400 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                id="track-payment-btn"
                onClick={handleTrackPayment}
                disabled={paymentTx.status === "pending" || !paymentAmount}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-3 rounded-2xl transition-transform active:translate-y-1 border-b-4 border-sky-700 active:border-b-0 shrink-0"
              >
                {paymentTx.status === "pending" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Track
              </button>
            </div>
            <div className="mt-4">
              <TxStatusBadge state={paymentTx} />
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Live State ═══════════════════════════════════════════════ */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-blue-950 mb-2">Live Contract State</h2>

          <LiveBidPanel loading={dataLoading} />
          <LivePollPanel loading={dataLoading} />

          {/* ── User Score ── */}
          <div className="rounded-3xl border-4 border-blue-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
            <SectionHeader
              icon={Trophy}
              title="Your Score"
              color="bg-rose-100 border-rose-200 text-rose-500"
            />
            {dataLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-blue-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : userScore ? (
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Total Score"
                  value={userScore.score}
                  icon={Star}
                  color="bg-rose-50 border-rose-200 text-rose-500"
                />
                <StatCard
                  label="Bids Placed"
                  value={userScore.bids}
                  icon={Gavel}
                  color="bg-indigo-50 border-indigo-200 text-indigo-500"
                />
                <StatCard
                  label="Votes Cast"
                  value={userScore.votes}
                  icon={Vote}
                  color="bg-violet-50 border-violet-200 text-violet-500"
                />
                <StatCard
                  label="Payments"
                  value={userScore.payments}
                  icon={Activity}
                  color="bg-sky-50 border-sky-200 text-sky-500"
                />
              </div>
            ) : (
              <p className="text-blue-400 font-bold text-sm">No score data available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
