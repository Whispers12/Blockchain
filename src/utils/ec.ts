/*
 * TODO: implement elliptic curves by myself
 * less dependencies - best choice
 */
import * as EC from "elliptic";

const ec = new EC.ec("secp256k1");

export { ec };
