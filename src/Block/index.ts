import { GENESIS_DATA } from "../config";
import { cryptoHash } from "../CryptoHash";

type IBlock = {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any;
  nonce: number;
  difficulty: number;
};

class Block {
  timestamp: number;
  lastHash: string;
  hash: string;
  data: any;
  nonce: number;
  difficulty: number;
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }: IBlock) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new Block(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }: { lastBlock: IBlock; data: any }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const { difficulty } = lastBlock;

    let nonce = 0;

    // TODO: add hash
    return new Block({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash: cryptoHash(timestamp, lastHash, data)
    });
  }
}

export { Block };
