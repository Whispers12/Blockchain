import { Wallet } from "./index";
import { STARTING_BALANCE } from "../config";
import { ec, verifySignature } from "../Crypto/";
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

  describe("signing data", () => {
    const data = "kek";
    it("should verifies signature", () => {
      const isValid = verifySignature({
        publicKey: wallet.getPublicKey(),
        data,
        signature: wallet.sign(data)
      });

      expect(isValid).toBe(true);
    });

    it("should doesnt verified an invalid signature", () => {
      const isValid = verifySignature({
        publicKey: wallet.getPublicKey(),
        data,
        signature: new Wallet().sign(data)
      });

      expect(isValid).toBe(false);
    });
  });
});
