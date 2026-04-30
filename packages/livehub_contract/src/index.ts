import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBEJ2TREGJ6MC6SII7QZUEPV45RHILA4J74DBXGJVCIMWYXYCGNFQJLR",
  }
} as const

export type DataKey = {tag: "User", values: readonly [string]} | {tag: "HighestBid", values: void} | {tag: "HighestBidder", values: void} | {tag: "PollYes", values: void} | {tag: "PollNo", values: void};


export interface UserStats {
  bids: u32;
  payments: u32;
  score: u32;
  votes: u32;
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({user, vote_yes}: {user: string, vote_yes: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a place_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  place_bid: ({user, amount}: {user: string, amount: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a track_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  track_payment: ({user, amount}: {user: string, amount: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_user_score transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_score: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<UserStats>>

  /**
   * Construct and simulate a get_highest_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_highest_bid: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_poll_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_poll_results: (options?: MethodOptions) => Promise<AssembledTransaction<readonly [u32, u32]>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAEAAAAAAAAABFVzZXIAAAABAAAAEwAAAAAAAAAAAAAACkhpZ2hlc3RCaWQAAAAAAAAAAAAAAAAADUhpZ2hlc3RCaWRkZXIAAAAAAAAAAAAAAAAAAAdQb2xsWWVzAAAAAAAAAAAAAAAABlBvbGxObwAA",
        "AAAAAQAAAAAAAAAAAAAACVVzZXJTdGF0cwAAAAAAAAQAAAAAAAAABGJpZHMAAAAEAAAAAAAAAAhwYXltZW50cwAAAAQAAAAAAAAABXNjb3JlAAAAAAAABAAAAAAAAAAFdm90ZXMAAAAAAAAE",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAh2b3RlX3llcwAAAAEAAAAA",
        "AAAAAAAAAAAAAAAJcGxhY2VfYmlkAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAANdHJhY2tfcGF5bWVudAAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAAOZ2V0X3VzZXJfc2NvcmUAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAB9AAAAAJVXNlclN0YXRzAAAA",
        "AAAAAAAAAAAAAAAPZ2V0X2hpZ2hlc3RfYmlkAAAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAQZ2V0X3BvbGxfcmVzdWx0cwAAAAAAAAABAAAD7QAAAAIAAAAEAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<null>,
        place_bid: this.txFromJSON<null>,
        track_payment: this.txFromJSON<null>,
        get_user_score: this.txFromJSON<UserStats>,
        get_highest_bid: this.txFromJSON<u32>,
        get_poll_results: this.txFromJSON<readonly [u32, u32]>
  }
}