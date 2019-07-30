import { GENESIS_DATA } from "../config";
import { cryptoHash } from "../CryptoHash";

type IBlock = {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any;
};

class Block {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any;
  constructor({ timestamp, lastHash, hash, data }: IBlock) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    return new Block(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }: { lastBlock: IBlock; data: any }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;

    // TODO: add hash
    return new Block({
      timestamp,
      lastHash,
      data,
      hash: cryptoHash(timestamp, lastHash, data)
    });
  }
}

export { Block };
