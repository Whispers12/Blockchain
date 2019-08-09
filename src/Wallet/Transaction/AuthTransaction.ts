import { REWARD_INPUT, MINING_REWARD } from "../../config";
import { IWallet } from "..";
import * as uuid from "uuid/v1";

interface IAuthTransaction {
  getOutputMap(): OutputMap;
  getInput(): typeof REWARD_INPUT;
  getId(): string;
}

type OutputMap = { [key: string]: number };

class AuthTransaction implements IAuthTransaction {
  input: typeof REWARD_INPUT;
  outputMap: OutputMap;
  id: string;
  constructor({
    input,
    outputMap
  }: {
    input: typeof REWARD_INPUT;
    outputMap: OutputMap;
  }) {
    this.id = uuid();
    this.input = input;
    this.outputMap = outputMap;
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

  static rewardTransaction({
    minerWallet
  }: {
    minerWallet: IWallet;
  }): AuthTransaction {
    const minerWalletKey = minerWallet.getPublicKey() as string;
    const input = REWARD_INPUT;
    const outputMap = { [minerWalletKey]: MINING_REWARD };
    return new AuthTransaction({
      input,
      outputMap
    });
  }
}

export { AuthTransaction, IAuthTransaction };
