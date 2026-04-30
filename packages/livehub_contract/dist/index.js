import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAEAAAAAAAAABFVzZXIAAAABAAAAEwAAAAAAAAAAAAAACkhpZ2hlc3RCaWQAAAAAAAAAAAAAAAAADUhpZ2hlc3RCaWRkZXIAAAAAAAAAAAAAAAAAAAdQb2xsWWVzAAAAAAAAAAAAAAAABlBvbGxObwAA",
            "AAAAAQAAAAAAAAAAAAAACVVzZXJTdGF0cwAAAAAAAAQAAAAAAAAABGJpZHMAAAAEAAAAAAAAAAhwYXltZW50cwAAAAQAAAAAAAAABXNjb3JlAAAAAAAABAAAAAAAAAAFdm90ZXMAAAAAAAAE",
            "AAAAAAAAAAAAAAAEdm90ZQAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAh2b3RlX3llcwAAAAEAAAAA",
            "AAAAAAAAAAAAAAAJcGxhY2VfYmlkAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAABAAAAAA=",
            "AAAAAAAAAAAAAAANdHJhY2tfcGF5bWVudAAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAQAAAAA",
            "AAAAAAAAAAAAAAAOZ2V0X3VzZXJfc2NvcmUAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAB9AAAAAJVXNlclN0YXRzAAAA",
            "AAAAAAAAAAAAAAAPZ2V0X2hpZ2hlc3RfYmlkAAAAAAAAAAABAAAABA==",
            "AAAAAAAAAAAAAAAQZ2V0X3BvbGxfcmVzdWx0cwAAAAAAAAABAAAD7QAAAAIAAAAEAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        vote: (this.txFromJSON),
        place_bid: (this.txFromJSON),
        track_payment: (this.txFromJSON),
        get_user_score: (this.txFromJSON),
        get_highest_bid: (this.txFromJSON),
        get_poll_results: (this.txFromJSON)
    };
}
