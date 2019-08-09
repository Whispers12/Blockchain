import { Transaction } from "../Wallet/Transaction";
import { Block } from "./Block";
import { cryptoHash } from "../Crypto";
import { REWARD_INPUT, MINING_REWARD } from "../config";

interface IBlockchain {
  replaceChain(chain: Chain, onSuccess?: Function): void;
  addBlock({ data }: any): this;
  getChain(): Chain;
  validateTransactionData({ chain }: { chain: Chain }): boolean;
}

type Chain = Array<Block>;
class Blockchain implements IBlockchain {
  chain: Chain;
  constructor() {
    this.chain = [Block.genesis()];
  }

  public getChain() {
    return this.chain;
  }

  validateTransactionData({ chain }: { chain: Chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.getInput().address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) {
            console.error("Miner rewards exceed limit");
            return false;
          }

          const outputMap = transaction.getOutputMap();
          if (outputMap[Object.keys(outputMap)[0]] !== MINING_REWARD) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.validateTransaction(transaction)) {
            console.error("Invalid transaction");
            return false;
          }
        }
      }
    }

    return true;
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

      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true;
  }

  replaceChain(chain: Chain, onSuccess?: Function) {
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming must be valid");
      return;
    }

    if (onSuccess) onSuccess();
    console.log("replacing chain with", chain);
    this.chain = chain;
  }
}

export { Blockchain, IBlockchain, Chain };
