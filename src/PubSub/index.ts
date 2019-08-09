import { ITransactionPool } from "../Wallet/TransactionPool/";
import * as Redis from "ioredis";
import { Blockchain } from "../Blockchain";
import { ITransaction } from "../Wallet/Transaction";

type TCHANNELS = {
  TEST: "TEST";
  BLOCKCHAIN: "BLOCKCHAIN";
  TRANSACTION: "TRANSACTION";
};

const CHANNELS: TCHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION"
};

type Channel = keyof TCHANNELS;

type Constructor = {
  blockchain: Blockchain;
  transactionPool: ITransactionPool;
};

interface IPubSub {
  broadcastChain(): void;
  broadcastTransaction(transaction: ITransaction): void;
}

class PubSub implements IPubSub {
  subscriber: Redis.Redis;
  publisher: Redis.Redis;
  blockchain: Blockchain;
  transactionPool: ITransactionPool;
  constructor({ blockchain, transactionPool }: Constructor) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.subscriber = new Redis();
    this.publisher = new Redis();

    this.subscribeToChannels();

    this.subscriber.on("message", (channel, message) =>
      this.handleMessage(channel, message)
    );
  }

  private subscribeToChannels() {
    (Object.keys(CHANNELS) as Array<Channel>).forEach(channel => {
      const result = CHANNELS[channel];
      this.subscriber.subscribe(result);
    });
  }

  private publish({ channel, message }: { channel: string; message: string }) {
    this.subscriber.unsubscribe(channel);
    this.publisher.publish(channel, message);
    this.subscriber.subscribe(channel);
  }

  private handleMessage(channel: string, message: string) {
    console.log(`Message recieved. Channel: ${channel}. Message: ${message}`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        break;
    }
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction: ITransaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

export { PubSub, IPubSub };
