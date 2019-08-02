import { TransactionPool, ITransactionPool } from ".";
import { Transaction, ITransaction } from "../Transaction/";
import { Wallet, IWallet } from "../";

describe("Transaction pool", () => {
  let transactionPool: ITransactionPool,
    transaction: ITransaction,
    senderWallet: IWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: "some-recipient",
      amount: 50
    });
  });

  describe("setTransaction()", () => {
    it("should adds transaction", () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.getTransactionMap()[transaction.getId()]).toBe(
        transaction
      );
    });
  });

  describe("getExistingTransaction()", () => {
    it("should returns an existing transaction given an input address", () => {
      transactionPool.setTransaction(transaction);

      expect(
        transactionPool.getExistingTransaction({
          inputAddress: senderWallet.getPublicKey()
        })
      ).toBe(transaction);
    });
  });
});
