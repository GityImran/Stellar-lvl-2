"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import LiveHubDashboard from "@/components/LiveHubDashboard";
import ActivityFeed from "@/components/ActivityFeed";
import Leaderboard from "@/components/Leaderboard";
import { WalletData } from "@/types/wallet";
import { Activity, Zap } from "lucide-react";

export default function Home() {
  const [wallet, setWallet] = useState<WalletData | null>(null);

  return (
    <main className="min-h-screen bg-sky-100 text-blue-950 relative overflow-hidden">
      {/* ── Playful Cartoon Background Clouds ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white opacity-60 mix-blend-overlay blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-blue-200 opacity-40 blur-2xl" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-white opacity-50 blur-3xl" />
        {/* Crisp cartoon clouds */}
        <div className="absolute top-20 right-32 w-32 h-16 bg-white rounded-full opacity-80" />
        <div className="absolute top-16 right-40 w-20 h-20 bg-white rounded-full opacity-80" />
        
        <div className="absolute top-60 left-10 w-40 h-20 bg-white rounded-full opacity-60" />
        <div className="absolute top-52 left-20 w-24 h-24 bg-white rounded-full opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center border-b-4 border-blue-700 shadow-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-950">
                Stellar LiveHub
              </h1>
              <p className="text-sm font-medium text-blue-600">
                Decentralized Realtime Platform · Testnet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border-2 border-blue-200 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-800">Live on Stellar</span>
          </div>
        </header>

        {/* ── Top Section: Wallet + Dashboard ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Left: Wallet Panel */}
          <aside className="space-y-6">
            <WalletConnect
              onConnected={(data) => setWallet(data)}
              onDisconnected={() => setWallet(null)}
            />

            {/* Network Status System */}
            <div className="rounded-3xl border-4 border-blue-200 bg-white p-5 shadow-[4px_4px_0_0_rgba(191,219,254,1)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-blue-900 uppercase tracking-wider">
                  Network Status
                </span>
              </div>
              <div className="bg-sky-50 rounded-2xl p-3 border-2 border-sky-100">
                <p className="text-[10px] font-mono text-blue-600 break-all leading-relaxed font-semibold">
                  {process.env.NEXT_PUBLIC_CONTRACT_ID ||
                    "CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-blue-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Network</span>
                  <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">RPC</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-500"></div>
                    <span className="text-xs font-bold text-blue-600 truncate max-w-[140px]">
                      soroban-testnet.stellar.org
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Contract Sync</span>
                  <span className="text-xs font-black text-emerald-500">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Polling</span>
                  <span className="text-xs font-bold text-blue-500">every 4s</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Dashboard */}
          <section className="min-w-0">
            <LiveHubDashboard wallet={wallet} />
          </section>
        </div>

        {/* ── Bottom Section: Activity Feed + Leaderboard ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <Leaderboard />
        </div>

        {/* ── Footer ── */}
        <footer className="pt-8 pb-6 border-t-4 border-blue-200 mt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-blue-400">
              © {new Date().getFullYear()} Stellar LiveHub. Built with Soroban & Next.js.
            </p>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border-2 border-blue-200 shadow-sm">
              <span className="text-xs font-bold text-blue-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Vercel Ready
              </span>
              <div className="w-px h-4 bg-blue-200"></div>
              <a
                href="https://stellar.expert/explorer/testnet/contract/CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors"
              >
                View Contract
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}