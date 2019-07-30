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
      const { timestamp, lastHash, hash, data } = chain[i];

      const actualHash = chain[i - 1].hash;

      if (lastHash !== actualHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data);

      if (hash !== validatedHash) return false;
    }

    return true;
  }
}

export { Blockchain };
