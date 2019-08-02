import { TransactionPool, ITransactionPool } from ".";
import { Transaction, ITransaction } from "../Transaction/";
import { Wallet, IWallet } from "../";

describe("Transaction pool", () => {
  let transactionPool: ITransactionPool, transaction: ITransaction;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    transaction = new Transaction({
      senderWallet: new Wallet(),
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
});
