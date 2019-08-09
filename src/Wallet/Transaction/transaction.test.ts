import { Wallet, IWallet } from "..";
import { Transaction, ITransaction } from ".";
import { verifySignature } from "../../Crypto/";
import * as EC from "elliptic";
import { REWARD_INPUT, MINING_REWARD } from "../../config";
import { IAuthTransaction, AuthTransaction } from "./AuthTransaction";

describe("Transaction", () => {
  let transaction: ITransaction,
    senderWallet: IWallet,
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
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });

    describe("when transaction is invalid", () => {
      describe("and a transaction outputMap is invalid", () => {
        it("should return false and logs an error", () => {
          transaction.getOutputMap()[
            senderWallet.getPublicKey() as string
          ] = 999999;

          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the transaction input signature is invalid", () => {
        it("should return false and logs an error", () => {
          transaction.getInput().signature = new Wallet().sign("data");
          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe("update()", () => {
    let originalSignature: EC.ec.Signature,
      originalSenderOutput: number,
      nextRecipient: string,
      nextAmount: number;

    describe("and the amount is invalid", () => {
      it("should throws an error", () => {
        expect(() => {
          transaction.update({
            senderWallet,
            recipient: "foo",
            amount: 999999
          });
        }).toThrow("Amount exceeds balance");
      });
    });

    describe("and the amount is valid", () => {
      beforeEach(function() {
        originalSignature = transaction.getInput().signature;
        originalSenderOutput = transaction.getOutputMap()[
          senderWallet.getPublicKey() as string
        ];
        nextRecipient = "next-recipient";
        nextAmount = 50;

        transaction.update({
          senderWallet,
          recipient: nextRecipient,
          amount: nextAmount
        });
      });

      it("should outputs the amount to the next recipient", () => {
        expect(transaction.getOutputMap()[nextRecipient]).toEqual(nextAmount);
      });

      it("should subtracts the amount from the original sender output amount", () => {
        expect(
          transaction.getOutputMap()[senderWallet.getPublicKey() as string]
        ).toEqual(originalSenderOutput - nextAmount);
      });

      it("should maintains a total output that matches input amoint", () => {
        const outputMap = transaction.getOutputMap();
        const totalAmount = Object.keys(outputMap).reduce(
          (total, outputKey) => total + outputMap[outputKey],
          0
        );

        expect(totalAmount).toEqual(transaction.getInput().amount);
      });

      it("should resigns the transaction", () => {
        expect(transaction.getInput().signature).not.toEqual(originalSignature);
      });

      describe("and another update for same recipient", () => {
        let addedAmount: number;

        beforeEach(function() {
          addedAmount = 80;
          transaction.update({
            senderWallet,
            recipient: nextRecipient,
            amount: addedAmount
          });
        });

        it("adds to the recipient ", () => {
          expect(transaction.getOutputMap()[nextRecipient]).toEqual(
            nextAmount + addedAmount
          );
        });

        it("should subtracts the amount from original sender output amount", () => {
          expect(
            transaction.getOutputMap()[senderWallet.getPublicKey() as string]
          ).toEqual(originalSenderOutput - nextAmount - addedAmount);
        });
      });
    });
  });

  describe("rewardTransaction()", () => {
    let rewardTransaction: IAuthTransaction, minerWallet: IWallet;

    beforeEach(function() {
      minerWallet = new Wallet();
      rewardTransaction = AuthTransaction.rewardTransaction({ minerWallet });
    });

    it("should creates a transaction with the reward input", () => {
      expect(rewardTransaction.getInput()).toEqual(REWARD_INPUT);
    });

    it("should creates ones transaction for the miner with mining reward", () => {
      expect(
        rewardTransaction.getOutputMap()[minerWallet.getPublicKey() as string]
      ).toEqual(MINING_REWARD);
    });
  });
});
