import { ITransaction } from "../Transaction";
interface ITransactionPool {
  setTransaction(transaction: ITransaction): void;
  getTransactionMap(): TransactionMap;
}

type TransactionMap = {
  [id: string]: ITransaction;
};
class TransactionPool {
  transactionMap: TransactionMap;
  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction: ITransaction) {
    this.transactionMap[transaction.getId()] = transaction;
  }

  getTransactionMap() {
    return this.transactionMap;
  }
}

export { TransactionPool, ITransactionPool };
