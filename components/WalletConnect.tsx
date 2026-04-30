"use client";

import { useState } from "react";
import { walletKit } from "@/lib/wallet";
import { WalletData } from "@/types/wallet";
import { getBalance, hasEnoughBalance } from "@/lib/stellar";
import { Wallet, LogOut, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface WalletConnectProps {
  onConnected?: (wallet: WalletData) => void;
  onDisconnected?: () => void;
}

export default function WalletConnect({ onConnected, onDisconnected }: WalletConnectProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function connectWallet() {
    setError("");

    try {
      setLoading(true);

      const { address } = await walletKit.authModal();

      if (!address) {
        setError("Wallet connection failed");
        showToast({ type: "error", title: "Connection Failed", message: "Failed to connect to wallet." });
        return;
      }

      const balance = await getBalance(address);

      if (balance === null) {
        setError("Unable to fetch balance");
        showToast({ type: "error", title: "Balance Error", message: "Unable to fetch account balance." });
        return;
      }

      if (!hasEnoughBalance(balance, 1)) {
        const msg = "Insufficient balance (min 1 XLM required)";
        setError(msg);
        showToast({ type: "error", title: "Insufficient Balance", message: msg });
        return;
      }

      const walletData: WalletData = {
        address,
        balance,
        walletName: walletKit.selectedModule?.productName || "Stellar Wallet",
      };

      setWallet(walletData);
      onConnected?.(walletData);
      showToast({ type: "success", title: "Wallet Connected", message: `Connected as ${address.slice(0, 6)}...${address.slice(-4)}` });
    } catch (err: any) {
      console.error(err);

      const message = err?.message || "";

      if (message.toLowerCase().includes("not installed")) {
        const msg = "Wallet not installed. Please install a Stellar wallet extension.";
        setError(msg);
        showToast({ type: "error", title: "Wallet Not Found", message: msg });
      } else if (message.toLowerCase().includes("rejected")) {
        const msg = "Connection rejected by user.";
        setError(msg);
        showToast({ type: "info", title: "Connection Rejected", message: msg });
      } else {
        const msg = "Something went wrong. Please try again.";
        setError(msg);
        showToast({ type: "error", title: "Error", message: msg });
      }
    } finally {
      setLoading(false);
    }
  }

  function disconnectWallet() {
    setWallet(null);
    setError("");
    onDisconnected?.();
    showToast({ type: "info", title: "Wallet Disconnected", message: "Successfully disconnected your wallet." });
  }

  return (
    <div className="rounded-3xl border-4 border-blue-200 bg-white p-5 shadow-[4px_4px_0_0_rgba(191,219,254,1)] w-full transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-blue-900 uppercase tracking-wider">Stellar Wallet</h2>
          <p className="text-xs font-bold text-blue-400">
            {wallet ? "Connected" : "Not connected"}
          </p>
        </div>
        {wallet && (
          <div className="ml-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>

      {!wallet ? (
        <button
          id="connect-wallet-btn"
          onClick={connectWallet}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-3 rounded-2xl transition-transform active:translate-y-1 border-b-4 border-blue-700 active:border-b-0 disabled:active:translate-y-0 disabled:border-b-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-sky-50 border-2 border-sky-100 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Wallet</span>
              <span className="text-xs font-black text-blue-700">{wallet.walletName}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider shrink-0">Address</span>
              <span className="text-xs font-black font-mono text-blue-600 break-all text-right bg-blue-100 px-2 py-0.5 rounded-md">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Balance</span>
              <span className="text-sm font-black text-emerald-500">{parseFloat(wallet.balance).toFixed(2)} XLM</span>
            </div>
          </div>

          <button
            id="disconnect-wallet-btn"
            onClick={disconnectWallet}
            className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-2xl transition-transform active:translate-y-1 border-b-4 border-red-300 active:border-b-0"
          >
            <LogOut className="w-5 h-5" />
            Disconnect
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}