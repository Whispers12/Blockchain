import { GENESIS_DATA } from "../config";

class Block {
  public readonly timestamp: string;
  public readonly lastHash: string;
  public readonly hash: string;
  public readonly data: any;
  constructor({
    timestamp,
    lastHash,
    hash,
    data
  }: {
    timestamp: string;
    lastHash: string;
    hash: string;
    data: any;
  }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    return new Block(GENESIS_DATA);
  }
}

export { Block };
