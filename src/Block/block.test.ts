import { Block } from "./Block";
import { GENESIS_DATA } from "../config";

describe("Block", () => {
  const timestamp = "a-date";
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
});

describe("genesis ", () => {
  const genesisBlock = Block.genesis();
  it("returns Block instance", () => {
    expect(genesisBlock instanceof Block).toBe(true);
  });

  it("returns genesis data", () => {
    expect(genesisBlock).toEqual(GENESIS_DATA);
  });
});
