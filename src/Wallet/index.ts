import { STARTING_BALANCE } from "../config";
import { ec } from "../utils/ec";
import * as Elliptic from "elliptic";
import { cryptoHash } from "../Crypto";

class Wallet {
  private publicKey: string | Buffer;
  private balance: number;
  private keyPair: Elliptic.ec.KeyPair;
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode("hex", false);
  }

  getBalance() {
    return this.balance;
  }

  getPublicKey() {
    return this.publicKey;
  }

  sign<T>(data: T) {
    return this.keyPair.sign(cryptoHash(data));
  }
}

export { Wallet };
