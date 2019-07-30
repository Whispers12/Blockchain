import { Blockchain } from "./index";
import { Block } from "../Block/";
import { head } from "../utils/head";

describe("Blockchain", () => {
  const blockchain = new Blockchain();

  it("should contins a chain array", () => {
    expect(Array.isArray(blockchain.chain)).toBe(true);
  });

  it("should starts with genesis block", () => {
    expect(head(blockchain.chain)).toEqual(Block.genesis());
  });

  it("adds new block to the chain", () => {
    const data = "data";

    blockchain.addBlock({ data });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data);
  });
});
