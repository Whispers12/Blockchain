import { Block } from "../Block";
import { cryptoHash } from "../CryptoHash";

type Chain = Array<Block>;
class Blockchain {
  chain: Chain;
  constructor() {
    this.chain = [Block.genesis()];
  }

  public addBlock({ data }: { data: any }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });

    this.chain.push(newBlock);

    return this;
  }

  static isValidChain(chain: Chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      const actualHash = chain[i - 1].hash;

      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualHash) return false;

      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );

      if (hash !== validatedHash) return false;

      if (lastDifficulty - difficulty > 1) return false;
    }

    return true;
  }

  replaceChain(chain: Chain) {
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming must be valid");
      return;
    }

    console.log("replacing chain with", chain);
    this.chain = chain;
  }
}

export { Blockchain };
