"use client";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";

// Initialize the kit with testnet and default modules
if (typeof window !== "undefined") {
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: defaultModules(),
  });
}

export const walletKit = StellarWalletsKit;