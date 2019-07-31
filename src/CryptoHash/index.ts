import { createHash } from "crypto";
import { hexToBin } from "../utils/hexToBin";

export function cryptoHash(...inputs: Array<string | number>) {
  const hash = createHash("sha256");

  hash.update(inputs.sort().join(" "));

  return hexToBin(hash.digest("hex"));
}
