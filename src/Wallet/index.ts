import { Transaction } from "./Transaction/";
import { STARTING_BALANCE } from "../config";
import { ec } from "../Crypto/ec";
import * as Elliptic from "elliptic";
import { cryptoHash } from "../Crypto";
import { ErrorCodes } from "../constants";

interface IWallet {
  getPublicKey(): string | Buffer;
  sign<T>(data: T): Elliptic.ec.Signature;
  getBalance(): number;
  createTransaction({
    recipient,
    amount
  }: {
    recipient: string;
    amount: number;
  }): never | Transaction;
}
class Wallet implements IWallet {
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

  createTransaction({
    recipient,
    amount
  }: {
    recipient: string;
    amount: number;
  }): Transaction | never {
    if (amount > this.balance) {
      throw new Error(String(ErrorCodes.EXCEEDS_BALANCE_AMOUNT));
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }
}

export { Wallet, IWallet };
