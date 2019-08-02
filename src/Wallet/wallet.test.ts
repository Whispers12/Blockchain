import { Wallet, IWallet } from "./index";
import { STARTING_BALANCE } from "../config";
import { ec, verifySignature } from "../Crypto/";
import * as EC from "elliptic";
import { Transaction, ITransaction } from "./Transaction";
import { ErrorCodes } from "../constants";

describe("Wallet", () => {
  let wallet: IWallet;
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

  describe("createTransaction()", () => {
    describe("and amount exceeds the balance", () => {
      it("throws an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 999999,
            recipient: "foo-recipient"
          })
        ).toThrow(String(ErrorCodes.EXCEEDS_BALANCE_AMOUNT));
      });
    });

    describe("and the amount is valid", () => {
      let transaction: Transaction, amount: number, recipient: string;

      beforeEach(function() {
        amount = 50;
        recipient = "foo-recipient";
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it("should create an instance of Transaction", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it("should matches the transaction input with wallet", () => {
        expect(transaction.getInput().address).toEqual(wallet.getPublicKey());
      });

      it("should outputs the amount the recipient", () => {
        expect(transaction.getOutputMap()[recipient]).toEqual(amount);
      });
    });
  });
});
