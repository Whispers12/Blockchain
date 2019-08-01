import { Wallet } from "./index";
import { STARTING_BALANCE } from "../config";
import { ec } from "../utils/ec";
import * as EC from "elliptic";

describe("Wallet", () => {
  let wallet: Wallet;
  let publicKey: String | Buffer;

  beforeEach(function() {
    wallet = new Wallet();

    const keyPair = ec.genKeyPair();

    publicKey = keyPair.getPublic().encode("hex", false);
  });

  it("should has a balance", () => {
    expect(wallet.getBalance()).toEqual(STARTING_BALANCE);
  });

  it("should has a public key", () => {
    // TODO: rewrite this dummy test
    expect(typeof wallet.getPublicKey() === "string").toBe(true);
  });
});
