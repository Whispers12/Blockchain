import { Wallet } from "./index";
import { STARTING_BALANCE } from "../config";

describe("Wallet", () => {
  let wallet: Wallet;

  beforeEach(function() {
    wallet = new Wallet();
  });

  it("should has a balance", () => {
    expect(wallet.getBalance()).toEqual(STARTING_BALANCE);
  });

  it("should has a public key", () => {
    expect(typeof wallet.getPublicKey() === "string").toBe(true);
  });
});
