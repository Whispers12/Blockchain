import { ITransactionPool } from "../Wallet/TransactionPool";
import { IBlockchain } from "../Blockchain";
import { IWallet } from "../Wallet";
import { IPubSub } from "../PubSub/";

type Constructor = {
  blockchain: IBlockchain;

  transactionPool: ITransactionPool;
  wallet: IWallet;
  pubsub: IPubSub;
};

class TransactionMiner {
  blockchain: IBlockchain;
  transactionPool: ITransactionPool;
  wallet: IWallet;
  pubsub: IPubSub;
  constructor({ blockchain, transactionPool, wallet, pubsub }: Constructor) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  mineTransactions() {}
}

export { TransactionMiner };
