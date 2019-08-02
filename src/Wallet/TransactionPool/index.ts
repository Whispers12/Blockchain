import { ITransaction, Transaction } from "../Transaction";
interface ITransactionPool {
  setTransaction(transaction: ITransaction): void;
  getTransactionMap(): TransactionMap;
  getExistingTransaction({
    inputAddress
  }: {
    inputAddress: string | Buffer;
  }): ITransaction | void;
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

  getExistingTransaction({
    inputAddress
  }: {
    inputAddress: string | Buffer;
  }): ITransaction | void {
    const transactions = Object.keys(this.transactionMap);

    const findedTransactionKey = transactions.find(
      transactionKey =>
        this.transactionMap[transactionKey].getInput().address === inputAddress
    );

    if (findedTransactionKey) {
      return this.transactionMap[findedTransactionKey];
    }
  }
}

export { TransactionPool, ITransactionPool };
