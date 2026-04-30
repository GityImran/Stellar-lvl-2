"use client";

import React, { memo } from "react";
import { useRealtime } from "@/lib/realtime-context";
import type { LeaderboardEntry } from "@/types/events";
import { Trophy, Gavel, Vote, CreditCard, TrendingUp } from "lucide-react";

// ─── Medal colours for top-3 ──────────────────────────────────────────────────

const medalConfig: Record<
  number,
  { bg: string; border: string; text: string; label: string }
> = {
  0: {
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-600",
    label: "🥇",
  },
  1: {
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-500",
    label: "🥈",
  },
  2: {
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-600",
    label: "🥉",
  },
};

// ─── Single row ───────────────────────────────────────────────────────────────

const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const medal = medalConfig[rank];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
        medal
          ? `${medal.bg} ${medal.border}`
          : "bg-white border-blue-100"
      }`}
    >
      {/* Rank */}
      <div className="w-7 shrink-0 text-center">
        {medal ? (
          <span className="text-base leading-none drop-shadow-sm">{medal.label}</span>
        ) : (
          <span className="text-sm font-black text-blue-300">#{rank + 1}</span>
        )}
      </div>

      {/* Address */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-mono font-black truncate ${
            medal ? medal.text : "text-blue-900"
          }`}
        >
          {entry.shortUser}
        </p>
      </div>

      {/* Micro-stats */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <StatPill icon={Gavel} value={entry.bids} color="text-indigo-500" />
        <StatPill icon={Vote} value={entry.votes} color="text-violet-500" />
        <StatPill icon={CreditCard} value={entry.payments} color="text-sky-500" />
      </div>

      {/* Score */}
      <div className="shrink-0 text-right min-w-[48px]">
        <p
          className={`text-lg font-black tabular-nums ${
            medal ? medal.text : "text-blue-800"
          }`}
        >
          {entry.score}
        </p>
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">pts</p>
      </div>
    </div>
  );
});

function StatPill({
  icon: Icon,
  value,
  color,
}: {
  icon: React.ElementType;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded-lg border border-black/5">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-xs font-bold text-slate-600 tabular-nums">{value}</span>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const { leaderboard } = useRealtime();

  return (
    <div className="rounded-3xl border-4 border-blue-200 bg-white shadow-[4px_4px_0_0_rgba(191,219,254,1)] overflow-hidden flex flex-col h-full min-h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b-2 border-blue-100 bg-sky-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-amber-200 text-amber-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-blue-950 tracking-wide">Leaderboard</h3>
            <p className="text-xs font-bold text-blue-500">
              {leaderboard.length} participant{leaderboard.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-blue-400 uppercase tracking-wider bg-white px-3 py-2 rounded-xl border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-indigo-400" /> Bids
          </div>
          <div className="flex items-center gap-1.5">
            <Vote className="w-3.5 h-3.5 text-violet-400" /> Votes
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" /> Pay
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <p className="text-base text-blue-900 font-black">No activity yet</p>
              <p className="text-sm font-medium text-blue-400 mt-1 max-w-[200px] mx-auto leading-snug">
                Rankings update automatically when actions occur
              </p>
            </div>
          </div>
        ) : (
          leaderboard.map((entry, idx) => (
            <LeaderboardRow key={entry.user} entry={entry} rank={idx} />
          ))
        )}
      </div>
    </div>
  );
}
