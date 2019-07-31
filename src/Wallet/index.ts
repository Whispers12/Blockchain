import { STARTING_BALANCE } from "../config";

class Wallet {
  publicKey: string;
  balance: number;
  constructor() {
    this.balance = STARTING_BALANCE;
    this.publicKey = "123123";
  }

  getBalance() {
    return this.balance;
  }

  getPublicKey() {
    return this.publicKey;
  }
}

export { Wallet };
