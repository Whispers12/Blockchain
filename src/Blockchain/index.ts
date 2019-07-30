import { Block } from "../Block";

class Blockchain {
  chain: Array<Block>;
  constructor() {
    this.chain = [Block.genesis()];
  }

  public addBlock({ data }: { data: any }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });

    this.chain.push(newBlock);
  }
}

export { Blockchain };
