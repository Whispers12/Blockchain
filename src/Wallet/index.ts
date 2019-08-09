import { Transaction, ITransaction } from "./Transaction/";
import { STARTING_BALANCE } from "../config";
import { ec } from "../Crypto/ec";
import * as Elliptic from "elliptic";
import { cryptoHash } from "../Crypto";
import { ErrorCodes } from "../constants";
import { Chain } from "../Blockchain";

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
    chain?: Chain;
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
    amount,
    chain
  }: {
    recipient: string;
    amount: number;
    chain?: Chain;
  }): Transaction | never {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey as string
      });
    }

    if (amount > this.balance) {
      throw new Error(String(ErrorCodes.EXCEEDS_BALANCE_AMOUNT));
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  static calculateBalance({
    chain,
    address
  }: {
    chain: Chain;
    address: string;
  }): number {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.getInput().address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.getOutputMap()[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }
}

export { Wallet, IWallet };
