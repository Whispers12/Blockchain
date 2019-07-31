import { GENESIS_DATA, MINE_RATE } from "../../config";
import { cryptoHash } from "../CryptoHash";
import { hexToBin } from "../../utils/hexToBin";

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

  static adjustDifficulty({
    originalBlock,
    timestamp
  }: {
    originalBlock: Block;
    timestamp: number;
  }) {
    const { difficulty } = originalBlock;

    if (difficulty < 1) return 1;

    const difference = timestamp - originalBlock.timestamp;

    if (difference > MINE_RATE) return difficulty - 1;

    return difficulty + 1;
  }

  static mineBlock({ lastBlock, data }: { lastBlock: IBlock; data: any }) {
    let hash, timestamp;

    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;

    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp
      });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBin(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    // TODO: add hash
    return new Block({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash
    });
  }
}

export { Block };
