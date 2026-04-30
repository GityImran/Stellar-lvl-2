import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function getBalance(publicKey: string) {
  try {
    const account = await server.loadAccount(publicKey);

    const xlmBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );

    return xlmBalance?.balance || "0";
  } catch (error) {
    console.error(error);
    return null;
  }
}
export function hasEnoughBalance(
  balance: string,
  minimum = 1
) {
  return Number(balance) >= minimum;
}