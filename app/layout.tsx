import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RealtimeProvider } from "@/lib/realtime-context";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar LiveHub — Decentralized Realtime Platform",
  description:
    "A decentralized realtime platform built on Stellar Soroban. Live auctions, polls, payment tracking and leaderboards — all on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-sky-50 text-slate-900">
        <ToastProvider>
          <RealtimeProvider>
            {children}
            <ToastContainer />
          </RealtimeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
