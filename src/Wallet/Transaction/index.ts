import { PublicKey } from "./../../utils/ec";
import { Wallet } from "..";
import * as uuid from "uuid/v1";

type ConstructorType = {
  senderWallet: Wallet;
  recipient: PublicKey;
  amount: number;
};

type OutputMap = {
  [key: string]: number;
};

class Transaction {
  private id: string;
  private outputMap: OutputMap;
  private amount: number;
  constructor({ senderWallet, recipient, amount }: ConstructorType) {
    this.id = uuid();
    this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
    this.amount = amount;
  }

  getOutputMap(key: string) {
    return this.outputMap[key];
  }

  createOutputMap({ senderWallet, recipient, amount }: ConstructorType) {
    const outputMap: OutputMap = {};
    outputMap[recipient as string] = amount;

    outputMap[senderWallet.getPublicKey() as string] =
      senderWallet.getBalance() - amount;

    return outputMap;
  }
}

export { Transaction };
