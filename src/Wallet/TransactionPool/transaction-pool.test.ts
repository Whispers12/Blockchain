import { TransactionPool, ITransactionPool } from ".";
import { Transaction, ITransaction } from "../Transaction/";
import { Wallet, IWallet } from "../";
import { Blockchain } from "../../Blockchain";

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

  describe("validTransactions()", () => {
    let validTransactions: Array<ITransaction>, errorMock: typeof jest.fn;

    beforeEach(function() {
      validTransactions = [];
      errorMock = jest.fn();

      global.console.error = errorMock;

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: "any-recipient",
          amount: 30
        });

        if (i % 3 === 0) {
          transaction.getInput().amount = 999999;
        } else if (i % 3 === 1) {
          transaction.getInput().signature = new Wallet().sign("foo");
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it("should returns valid transaction", () => {
      expect(transactionPool.getValidTransactions()).toEqual(validTransactions);
    });

    it("should logs error for invalid transactions", () => {
      transactionPool.getValidTransactions();

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe("clear()", () => {
    it("should clears the transaction", () => {
      transactionPool.clear();

      expect(transactionPool.getTransactionMap()).toEqual({});
    });
  });

  describe("clearBlockchainTransactions()", () => {
    it("should clearBlockchainTransactions", () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap: {
        [transactionId: string]: ITransaction;
      } = {};

      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: "foo",
          amount: 20
        });

        transactionPool.setTransaction(transaction);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.getId()] = transaction;
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(transactionPool.getTransactionMap()).toEqual(
        expectedTransactionMap
      );
    });
  });
});
