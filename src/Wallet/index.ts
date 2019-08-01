import { STARTING_BALANCE } from "../config";
import { ec } from "../utils/ec";

class Wallet {
  private publicKey: string | Buffer;
  private balance: number;
  constructor() {
    this.balance = STARTING_BALANCE;
    const keyPair = ec.genKeyPair();

    this.publicKey = keyPair.getPublic().encode("hex", false);
  }

  getBalance() {
    return this.balance;
  }

  getPublicKey() {
    return this.publicKey;
  }
}

export { Wallet };
