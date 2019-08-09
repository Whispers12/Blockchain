import { ITransaction, Transaction } from "../Transaction";
import { Chain } from "../../Blockchain";
import { IAuthTransaction } from "../Transaction/AuthTransaction";
interface ITransactionPool {
  setTransaction(transaction: ITransaction): void;
  getTransactionMap(): TransactionMap;
  getExistingTransaction({
    inputAddress
  }: {
    inputAddress: string | Buffer;
  }): ITransaction | void;
  setMap(transactionMap: TransactionMap): void;
  getValidTransactions(): ITransaction[];
  clear(): void;
  clearBlockchainTransactions({ chain }: { chain: Chain }): void;
}

type TransactionMap = {
  [id: string]: ITransaction;
};
class TransactionPool implements ITransactionPool {
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

  clear() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions({ chain }: { chain: Chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction.getId()]) {
          delete this.transactionMap[transaction.getId()];
        }
      }
    }
  }

  setMap(transactionMap: TransactionMap) {
    this.transactionMap = transactionMap;
  }

  getValidTransactions() {
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
