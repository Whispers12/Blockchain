import { Wallet } from "..";
import { Transaction } from ".";
import { verifySignature } from "../../Crypto/";

describe("Transaction", () => {
  let transaction: Transaction,
    senderWallet: Wallet,
    recipient: string,
    amount: number;

  beforeEach(function() {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 60;

    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it("should has an ID", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("should has an outputMap", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("should outputs amount of recipient", () => {
      expect(transaction.getOutputMap()[recipient]).toEqual(amount);
    });

    it("should outputs the remaining balance for `sender wallet`", () => {
      expect(
        transaction.getOutputMap()[senderWallet.getPublicKey() as string]
      ).toEqual(senderWallet.getBalance() - amount);
    });
  });

  describe("input", () => {
    it("should has an INPUT", () => {
      expect(transaction).toHaveProperty("input");
    });

    it("should has a timestamp in the input", () => {
      expect(transaction.getInput()).toHaveProperty("timestamp");
    });

    it("should sets the `amount` to the `senderWallet` `balance` ", () => {
      expect(transaction.getInput().amount).toEqual(senderWallet.getBalance());
    });

    it("should sets the `address` to the `senderWallet` `publickKey`", () => {
      expect(transaction.getInput().address).toEqual(
        senderWallet.getPublicKey()
      );
    });

    it("should signs the input", () => {
      const publicKey = senderWallet.getPublicKey();
      const isValid = verifySignature({
        publicKey,
        data: transaction.getOutputMap(),
        signature: transaction.getInput().signature
      });

      expect(isValid).toBe(true);
    });
  });

  describe("valid transaction", () => {
    let errorMock: typeof jest.fn;

    beforeEach(function() {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe("when the transaction is valid", () => {
      it("should return true", () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      });
    });

    describe("when transaction is invalid", () => {
      describe("and a transaction outputMap is invalid", () => {
        it("should return false and logs an error", () => {
          transaction.getOutputMap()[
            senderWallet.getPublicKey() as string
          ] = 999999;

          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the transaction input signature is invalid", () => {
        it("should return false and logs an error", () => {
          transaction.getInput().signature = new Wallet().sign("data");
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});
