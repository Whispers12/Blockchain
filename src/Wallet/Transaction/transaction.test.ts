import { Wallet } from "..";
import { Transaction } from ".";

describe("Transaction", () => {
  let transaction: Transaction, senderWallet, recipient, amount;

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
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it("should outputs the remaining balance for `sender wallet`", () => {
      expect(transaction.outputMap[senderWallet.getPublicKey()]).toEqual(
        senderWallet.balance - amount
      );
    });
  });
});
