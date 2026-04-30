"use client";

import React, { memo } from "react";
import { useRealtime } from "@/lib/realtime-context";
import type { ActivityEntry } from "@/types/events";
import { Gavel, Vote, CreditCard, Activity, Wifi, WifiOff } from "lucide-react";

// ─── Single feed item ─────────────────────────────────────────────────────────

const FeedItem = memo(function FeedItem({ entry }: { entry: ActivityEntry }) {
  const icons: Record<ActivityEntry["kind"], React.ElementType> = {
    bid: Gavel,
    vote_yes: Vote,
    vote_no: Vote,
    payment: CreditCard,
  };

  const colors: Record<ActivityEntry["kind"], string> = {
    bid: "bg-indigo-100 border-2 border-indigo-200 text-indigo-500",
    vote_yes: "bg-emerald-100 border-2 border-emerald-200 text-emerald-500",
    vote_no: "bg-red-100 border-2 border-red-200 text-red-500",
    payment: "bg-sky-100 border-2 border-sky-200 text-sky-500",
  };

  const dotColors: Record<ActivityEntry["kind"], string> = {
    bid: "bg-indigo-500",
    vote_yes: "bg-emerald-500",
    vote_no: "bg-red-500",
    payment: "bg-sky-500",
  };

  const Icon = icons[entry.kind];

  const timeLabel = (() => {
    try {
      return new Date(entry.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return entry.timestamp;
    }
  })();

  return (
    <div
      className="flex items-start gap-4 px-5 py-4 hover:bg-sky-50/50 transition-colors duration-150 border-b-2 border-blue-50 last:border-0 animate-[fadeSlideIn_0.3s_ease-out]"
      style={{ animationFillMode: "both" }}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${colors[entry.kind]}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-blue-900 leading-snug">{entry.label}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotColors[entry.kind]}`} />
          <span className="text-[11px] font-bold text-blue-400 font-mono">{timeLabel}</span>
          {entry.ledger > 0 && (
            <span className="text-[11px] font-bold text-blue-300 font-mono bg-blue-50 px-1.5 py-0.5 rounded-md">
              ledger #{entry.ledger}
            </span>
          )}
        </div>
      </div>

      {/* Amount badge */}
      {entry.amount !== undefined && (
        <span className="shrink-0 text-xs font-black text-blue-600 bg-white border-2 border-blue-200 shadow-sm rounded-xl px-2.5 py-1">
          {entry.amount} XLM
        </span>
      )}
    </div>
  );
});

// ─── Connection status indicator ──────────────────────────────────────────────

function ConnectionPill({
  connected,
  error,
}: {
  connected: boolean;
  error: string | null;
}) {
  return (
    <div
      title={error ?? undefined}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 shadow-sm transition-colors ${
        connected
          ? "bg-emerald-100 border-emerald-200 text-emerald-600"
          : "bg-red-100 border-red-200 text-red-600"
      }`}
    >
      {connected ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      {connected ? "Live" : "Reconnecting…"}
    </div>
  );
}

// ─── ActivityFeed ─────────────────────────────────────────────────────────────

export default function ActivityFeed() {
  const { activityFeed, isConnected, lastError } = useRealtime();

  return (
    <div className="rounded-3xl border-4 border-blue-200 bg-white shadow-[4px_4px_0_0_rgba(191,219,254,1)] overflow-hidden flex flex-col h-full min-h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b-2 border-blue-100 bg-sky-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-purple-200 text-purple-500 flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-blue-950 tracking-wide">Live Activity</h3>
            <p className="text-xs font-bold text-blue-500">
              {activityFeed.length} events
            </p>
          </div>
        </div>
        <ConnectionPill connected={isConnected} error={lastError} />
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activityFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <p className="text-base text-blue-900 font-black">
                Waiting for events…
              </p>
              <p className="text-sm font-medium text-blue-400 mt-1 max-w-[200px] mx-auto leading-snug">
                Blockchain activity will appear here in real-time
              </p>
            </div>
            {/* Animated pulses */}
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          activityFeed.map((entry) => (
            <FeedItem key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
