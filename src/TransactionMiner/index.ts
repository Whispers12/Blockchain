import { ITransactionPool } from "../Wallet/TransactionPool";
import { IBlockchain } from "../Blockchain";
import { IWallet } from "../Wallet";
import { IPubSub } from "../PubSub/";
import { AuthTransaction } from "../Wallet/Transaction/AuthTransaction";

interface ITransactionMiner {
  mineTransactions(): void;
}

type Constructor = {
  blockchain: IBlockchain;

  transactionPool: ITransactionPool;
  wallet: IWallet;
  pubsub: IPubSub;
};

class TransactionMiner implements ITransactionMiner {
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

  mineTransactions() {
    const validTransactions = this.transactionPool.getValidTransactions();

    validTransactions.push(
      // this ts ignore need
      // @ts-ignore
      AuthTransaction.rewardTransaction({
        minerWallet: this.wallet
      })
    );

    this.blockchain.addBlock({ data: validTransactions });

    this.pubsub.broadcastChain();

    this.transactionPool.clear();
  }
}

export { TransactionMiner };
