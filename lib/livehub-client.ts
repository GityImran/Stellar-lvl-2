"use client";

import { Client, networks } from "livehub_contract";
import type { UserStats } from "livehub_contract";
import { Networks } from "@stellar/stellar-sdk";
import { walletKit } from "@/lib/wallet";

export type { UserStats };

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-testnet.stellar.org";

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  networks.testnet.contractId;

const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * Creates a read-only contract client (no signing needed).
 * Used for simulation / view queries.
 */
function createReadClient(): Client {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
  });
}

/**
 * Creates a signing contract client bound to the connected wallet address.
 * All write transactions will be signed by the wallet.
 */
function createSigningClient(publicKey: string): Client {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: async (tx: string) => {
      const { signedTxXdr } = await walletKit.signTransaction(tx, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      // ContractClient's SignTransaction expects { signedTxXdr: string }
      return { signedTxXdr };
    },
  });
}

// ─── READ FUNCTIONS ──────────────────────────────────────────────────────────

export async function fetchHighestBid(): Promise<number> {
  const client = createReadClient();
  const result = await client.get_highest_bid();
  return result.result as number;
}

export async function fetchPollResults(): Promise<[number, number]> {
  const client = createReadClient();
  const result = await client.get_poll_results();
  return result.result as [number, number];
}

export async function fetchUserScore(publicKey: string): Promise<UserStats> {
  const client = createReadClient();
  const result = await client.get_user_score({ user: publicKey });
  return result.result as UserStats;
}

// ─── WRITE FUNCTIONS ─────────────────────────────────────────────────────────

export async function submitPlaceBid(
  publicKey: string,
  amount: number
): Promise<string> {
  const client = createSigningClient(publicKey);
  const tx = await client.place_bid({ user: publicKey, amount });
  const response = await tx.signAndSend();
  return response.sendTransactionResponse?.hash || "confirmed";
}

export async function submitVote(
  publicKey: string,
  voteYes: boolean
): Promise<string> {
  const client = createSigningClient(publicKey);
  const tx = await client.vote({ user: publicKey, vote_yes: voteYes });
  const response = await tx.signAndSend();
  return response.sendTransactionResponse?.hash || "confirmed";
}

export async function submitTrackPayment(
  publicKey: string,
  amount: number
): Promise<string> {
  const client = createSigningClient(publicKey);
  const tx = await client.track_payment({ user: publicKey, amount });
  const response = await tx.signAndSend();
  return response.sendTransactionResponse?.hash || "confirmed";
}
