import * as Redis from "ioredis";
import { Blockchain } from "../Blockchain/";

type CHANNELS = {
  TEST: "TEST";
  BLOCKCHAIN: "BLOCKCHAIN";
};

const CHANNELS: CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN"
};

class PubSub {
  subscriber: Redis.Redis;
  publisher: Redis.Redis;
  blockchain: Blockchain;
  constructor({ blockchain }: { blockchain: Blockchain }) {
    this.blockchain = blockchain;

    this.subscriber = new Redis();
    this.publisher = new Redis();

    this.subscribeToChannels();

    this.subscriber.on("message", (channel, message) =>
      this.handleMessage(channel, message)
    );
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }: { channel: string; message: string }) {
    this.subscriber.unsubscribe(channel);
    this.publisher.publish(channel, message);
    this.subscriber.subscribe(channel);
  }

  handleMessage(channel: string, message: string) {
    console.log(`Message recieved. Channel: ${channel}. Message: ${message}`);

    const parsedMessage = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
    }
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }
}

export { PubSub };
