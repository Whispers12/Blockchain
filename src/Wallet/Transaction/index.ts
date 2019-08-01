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

interface ITransaction {
  getOutputMap(): OutputMap;
  getInput(): Input;
}

class Transaction implements ITransaction {
  private id: string;
  private outputMap: OutputMap;
  private amount: number;
  private input: Input;
  constructor({ senderWallet, recipient, amount }: ConstructorType) {
    this.id = uuid();
    this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    this.amount = amount;
  }

  getOutputMap() {
    return this.outputMap;
  }

  getInput() {
    return this.input;
  }

  static validTransaction(transaction: ITransaction) {
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

export { Transaction };
