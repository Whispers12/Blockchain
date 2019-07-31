import { Blockchain } from "./index";
import { Block } from "../Block/";
import { head } from "../utils/head";
import { last } from "../utils/last";
import { cryptoHash } from "../CryptoHash";

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
          difficulty: 3,
          nonce: 0,
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

      describe("and the chain contains a block with a jumped difficulty", () => {
        it("should return false", () => {
          const lastBlock = last(blockchain.chain);

          const lastHash = lastBlock.hash;

          const timestamp = Date.now();

          const nonce = 0;
          const data = "asda";

          const difficulty = lastBlock.difficulty - 3;

          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

          const badBlock = new Block({
            timestamp,
            lastHash,
            difficulty,
            nonce,
            hash,
            data
          });

          blockchain.chain.push(badBlock);

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
    let errorMock: typeof jest.fn, logMock: typeof jest.fn;

    beforeEach(function() {
      errorMock = jest.fn();
      logMock = jest.fn();

      global.console.error = errorMock;
      global.console.log = logMock;
    });

    describe("new chain is not longer", () => {
      beforeEach(function() {
        newChain.chain[0] = {
          data: "wrong-genesis",
          timestamp: 1,
          difficulty: 3,
          nonce: 0,
          lastHash: "dsadas",
          hash: "sadas"
        };

        blockchain.replaceChain(newChain.chain);
      });

      it("should does not replace the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it("should logs an error", () => {
        expect(errorMock).toHaveBeenCalled();
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
        beforeEach(function() {
          newChain.chain[2].hash = "fake-hash";

          blockchain.replaceChain(newChain.chain);
        });

        it("should does not replace the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it("should logs an error", () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the chain is valid", () => {
        beforeEach(function() {
          blockchain.replaceChain(newChain.chain);
        });

        it("should  replace the chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it("should logs about replace chain", () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
  });
});
