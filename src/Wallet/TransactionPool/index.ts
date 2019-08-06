import { ITransaction, Transaction } from "../Transaction";
interface ITransactionPool {
  setTransaction(transaction: ITransaction): void;
  getTransactionMap(): TransactionMap;
  getExistingTransaction({
    inputAddress
  }: {
    inputAddress: string | Buffer;
  }): ITransaction | void;
  setMap(transactionMap: TransactionMap): void;
  validateTransactions(): ITransaction[];
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

  setMap(transactionMap: TransactionMap) {
    this.transactionMap = transactionMap;
  }

  validateTransactions() {
    const validKeys = Object.keys(this.transactionMap).filter(
      transactionMapKey =>
        Transaction.validateTransaction(this.transactionMap[transactionMapKey])
    );

    return validKeys.map(key => this.transactionMap[key]);
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
