import { Blockchain } from "./index";
import { Block } from "../Block/";
import { head } from "../utils/head";

describe("Blockchain", () => {
  let blockchain: Blockchain;
  let newChain: Blockchain;
  let originalChain: Block[];

  beforeEach(() => {
    blockchain = new Blockchain();

    newChain = new Blockchain();

    originalChain = blockchain.chain;
  });

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

  describe("is valid chain", () => {
    describe("when chain doesnt starts with genesis block", () => {
      it("should returns false", () => {
        blockchain.chain[0] = {
          data: "wrong-genesis",
          timestamp: 1,
          lastHash: "dsadas",
          hash: "sadas"
        };

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe("when the chain starts with genesis and has multiple blocks", () => {
      beforeEach(() => {
        blockchain
          .addBlock({ data: "Bek" })
          .addBlock({ data: "kek" })
          .addBlock({ data: "ollol" });
      });

      describe("and a last hash reference has changed", () => {
        it("should returns false", () => {
          blockchain.chain[2].lastHash = "broken-lastHash";

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and a chain contain a block with invalid field", () => {
        it("should returns false", () => {
          blockchain.chain[2].data = "broken-data";

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and a chain doesnt contain invalid block", () => {
        it("should returns true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe("replace chain", () => {
    describe("new chain is not longer", () => {
      it("should does not replace the chain", () => {
        newChain.chain[0] = {
          data: "wrong-genesis",
          timestamp: 1,
          lastHash: "dsadas",
          hash: "sadas"
        };

        blockchain.replaceChain(newChain.chain);

        expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe("when the chain is longer", () => {
      beforeEach(function() {
        newChain
          .addBlock({ data: "Bek" })
          .addBlock({ data: "kek" })
          .addBlock({ data: "ollol" });
      });

      describe("and the chain is invalid", () => {
        it("should does not replace the chain", () => {
          newChain.chain[2].hash = "fake-hash";

          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe("and the chain is valid", () => {
        it("should  replace the chain", () => {
          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});
