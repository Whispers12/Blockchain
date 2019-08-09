import { PublicKey, verifySignature } from "../../Crypto/ec";
import { Wallet, IWallet } from "..";
import * as Elliptic from "elliptic";
import * as uuid from "uuid/v1";

type ConstructorType = {
  senderWallet: IWallet;
  recipient: PublicKey;
  amount: number;
};

type OutputMap = {
  [key: string]: number;
};

type Input = {
  timestamp: number;
  amount: number;
  address: string | Buffer;
  signature: Elliptic.ec.Signature;
};

type UpdateArgs = {
  senderWallet: IWallet;
  recipient: string;
  amount: number;
};

interface ITransaction {
  getOutputMap(): OutputMap;
  getInput(): Input;
  update({ senderWallet, recipient, amount }: UpdateArgs): void | never;
  getId(): string;
}

class Transaction implements ITransaction {
  id: string;
  outputMap: OutputMap;
  input: Input;

  constructor({ senderWallet, recipient, amount }: ConstructorType) {
    this.id = uuid();

    this.outputMap = this.createOutputMap({
      senderWallet,
      recipient,
      amount
    });

    this.input = this.createInput({
      senderWallet,
      outputMap: this.outputMap
    });
  }

  update({ senderWallet, recipient, amount }: UpdateArgs) {
    if (amount > this.outputMap[senderWallet.getPublicKey() as string]) {
      throw new Error("Amount exceeds balance");
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    const senderPublicKey = senderWallet.getPublicKey() as string;
    this.outputMap[senderPublicKey] = this.outputMap[senderPublicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  getOutputMap() {
    return this.outputMap;
  }

  getInput() {
    return this.input;
  }

  getId() {
    return this.id;
  }

  static validateTransaction(transaction: ITransaction) {
    // @ts-ignore
    const { address, amount, signature } = transaction.getInput();
    const outputMap = transaction.getOutputMap();

    const outputTotal = Object.keys(outputMap).reduce(
      (total, outputKey) => total + outputMap[outputKey],
      0
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid siganture from ${address}`);
      return false;
    }
    return true;
  }

  private createOutputMap({
    senderWallet,
    recipient,
    amount
  }: ConstructorType) {
    const outputMap: OutputMap = {};
    outputMap[recipient as string] = amount;

    outputMap[senderWallet.getPublicKey() as string] =
      senderWallet.getBalance() - amount;

    return outputMap;
  }

  private createInput({
    senderWallet,
    outputMap
  }: {
    outputMap: OutputMap;
    senderWallet: IWallet;
  }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.getBalance(),
      address: senderWallet.getPublicKey(),
      signature: senderWallet.sign(outputMap)
    };
  }
}

export { Transaction, ITransaction };
