import { Wallet, IWallet } from "./index";
import { STARTING_BALANCE } from "../config";
import { ec, verifySignature } from "../Crypto/";
import * as EC from "elliptic";
import { Transaction, ITransaction } from "./Transaction";
import { ErrorCodes } from "../constants";
import { Blockchain, IBlockchain } from "../Blockchain";
import {
  AuthTransaction,
  IAuthTransaction
} from "./Transaction/AuthTransaction";

describe("Wallet", () => {
  let wallet: IWallet;
  let publicKey: String | Buffer;

  beforeEach(function() {
    wallet = new Wallet();

    const keyPair = ec.genKeyPair();

    publicKey = keyPair.getPublic().encode("hex", false);
  });

  it("should has a balance", () => {
    expect(wallet.getBalance()).toEqual(STARTING_BALANCE);
  });

  it("should has a public key", () => {
    // TODO: rewrite this dummy test
    expect(typeof wallet.getPublicKey() === "string").toBe(true);
  });

  describe("signing data", () => {
    const data = "kek";
    it("should verifies signature", () => {
      const isValid = verifySignature({
        publicKey: wallet.getPublicKey(),
        data,
        signature: wallet.sign(data)
      });

      expect(isValid).toBe(true);
    });

    it("should doesnt verified an invalid signature", () => {
      const isValid = verifySignature({
        publicKey: wallet.getPublicKey(),
        data,
        signature: new Wallet().sign(data)
      });

      expect(isValid).toBe(false);
    });
  });

  describe("createTransaction()", () => {
    describe("and amount exceeds the balance", () => {
      it("throws an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 999999,
            recipient: "foo-recipient"
          })
        ).toThrow(String(ErrorCodes.EXCEEDS_BALANCE_AMOUNT));
      });
    });

    describe("and the amount is valid", () => {
      let transaction: Transaction, amount: number, recipient: string;

      beforeEach(function() {
        amount = 50;
        recipient = "foo-recipient";
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it("should create an instance of Transaction", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it("should matches the transaction input with wallet", () => {
        expect(transaction.getInput().address).toEqual(wallet.getPublicKey());
      });

      it("should outputs the amount the recipient", () => {
        expect(transaction.getOutputMap()[recipient]).toEqual(amount);
      });
    });

    describe("and the chain is passed", () => {
      it("should calls Wallet.calculateBalance", () => {
        const calculateBalanceMock = jest.fn();

        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: "foo",
          amount: 10,
          chain: new Blockchain().chain
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe("calculateBalance()", () => {
    let blockchain: IBlockchain;

    beforeEach(function() {
      blockchain = new Blockchain();
    });

    describe("and there no outputs for the wallet", () => {
      it("should returns starting balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.getChain(),
            address: wallet.getPublicKey() as string
          })
        ).toEqual(STARTING_BALANCE);
      });
    });

    describe("and there are outputs for the wallet", () => {
      let transactionOne: ITransaction, transactionTwo: ITransaction;

      beforeEach(function() {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.getPublicKey() as string,
          amount: 50
        });

        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.getPublicKey() as string,
          amount: 60
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it("should adds sum of all outputs to the wallet balance", () => {
        const balance = Wallet.calculateBalance({
          chain: blockchain.getChain(),
          address: wallet.getPublicKey() as string
        });

        expect(balance).toEqual(
          STARTING_BALANCE +
            transactionOne.getOutputMap()[wallet.getPublicKey() as string] +
            transactionTwo.getOutputMap()[wallet.getPublicKey() as string]
        );
      });

      describe("and the wallet has made a transaction", () => {
        let recentTransaction: ITransaction;

        beforeEach(function() {
          recentTransaction = wallet.createTransaction({
            recipient: "foo",
            amount: 30
          });

          blockchain.addBlock({ data: [recentTransaction] });
        });

        it("should return the output amount of the recent transaction", () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.getChain(),
              address: wallet.getPublicKey() as string
            })
          ).toEqual(
            recentTransaction.getOutputMap()[wallet.getPublicKey() as string]
          );
        });

        describe("and there are outputs next to and after the recent transaction", () => {
          let sameBlockTransaction: IAuthTransaction,
            nextBlockTransaction: ITransaction;

          beforeEach(function() {
            recentTransaction = wallet.createTransaction({
              recipient: "foo",
              amount: 60
            });

            sameBlockTransaction = AuthTransaction.rewardTransaction({
              minerWallet: wallet
            });

            blockchain.addBlock({
              data: [recentTransaction, sameBlockTransaction]
            });

            nextBlockTransaction = new Wallet().createTransaction({
              recipient: wallet.getPublicKey() as string,
              amount: 75
            });

            blockchain.addBlock({ data: [nextBlockTransaction] });
          });

          it("should includes the output amount ", () => {
            const walletPublicKey = wallet.getPublicKey() as string;
            expect(
              Wallet.calculateBalance({
                chain: blockchain.getChain(),
                address: walletPublicKey
              })
            ).toEqual(
              recentTransaction.getOutputMap()[walletPublicKey] +
                sameBlockTransaction.getOutputMap()[walletPublicKey] +
                nextBlockTransaction.getOutputMap()[walletPublicKey]
            );
          });
        });
      });
    });
  });
});
