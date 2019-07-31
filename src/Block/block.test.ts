import { Block } from ".";
import { GENESIS_DATA, MINE_RATE } from "../config";
import { cryptoHash } from "../CryptoHash";
import { hexToBin } from "../utils/hexToBin";

describe("Block", () => {
  const timestamp = 2000;
  const lastHash = "foo-hash";
  const hash = "bar-hash";
  const data = ["blockchain"];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  });

  it("has a timestamp lastHash hash data", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.timestamp).toEqual(timestamp);

    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe("genesis ", () => {
    const genesisBlock = Block.genesis();
    it("returns Block instance", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("returns block with genesis data", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe("mine Block", () => {
    const lastBlock = Block.genesis();
    const data = "mined data";

    const minedBlock = Block.mineBlock({ lastBlock, data });

    it("returns a Block instance", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it("sets the `last` hash to be the `hash` of last Block", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it("sets the `data`", () => {
      expect(minedBlock.data).toEqual(data);
    });

    it("sets the `timestamp`", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it("should creates SHA-256 hash based on proper inputs", () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data
        )
      );
    });

    it("should sets hash that matches difficulty criteria", () => {
      expect(
        hexToBin(minedBlock.hash).substring(0, minedBlock.difficulty)
      ).toEqual("0".repeat(minedBlock.difficulty));
    });

    it("should adjust the difficulty", () => {
      const possibleResults = [
        lastBlock.difficulty + 1,
        lastBlock.difficulty - 1
      ];

      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe("adjust difficulty", () => {
    it("should raises difficulty for qiuckly mined block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100
        })
      ).toEqual(block.difficulty + 1);
    });

    it("should lower difficulty for slowly mined block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100
        })
      ).toEqual(block.difficulty - 1);
    });

    it("should has a lower limit of 1", () => {
      block.difficulty = -1;

      expect(
        Block.adjustDifficulty({ originalBlock: block, timestamp: 1000 })
      ).toEqual(1);
    });
  });
});
