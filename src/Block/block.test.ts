import { Block } from ".";
import { GENESIS_DATA } from "../config";
import { cryptoHash } from "../CryptoHash";

describe("Block", () => {
  const timestamp = 2;
  const lastHash = "foo-hash";
  const hash = "bar-hash";
  const data = ["blockchain"];
  const block = new Block({ timestamp, lastHash, hash, data });

  it("has a timestamp lastHash hash data", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.timestamp).toEqual(timestamp);
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
        cryptoHash(minedBlock.timestamp, lastBlock.hash, data)
      );
    });
  });
});
