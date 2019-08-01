/*
 * TODO: implement elliptic curves by myself
 * less dependencies - best choice
 */
import * as EC from "elliptic";
import { cryptoHash } from "../Blockchain/CryptoHash";

const ec = new EC.ec("secp256k1");

export type PublicKey =
  | Uint8Array
  | Buffer
  | string
  | { x: string; y: string }
  | EC.ec.KeyPair;

type ObjectForSign = {
  publicKey: PublicKey;

  data: EC.BNInput;
  signature: EC.ec.Signature | EC.ec.SignatureOptions | string;
};

function verifySignature({ publicKey, data, signature }: ObjectForSign) {
  const keyPublic = ec.keyFromPublic(publicKey, "hex");

  return keyPublic.verify(cryptoHash(data), signature);
}

export { ec, verifySignature };
