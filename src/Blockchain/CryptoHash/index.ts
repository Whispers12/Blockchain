import { createHash } from "crypto";

export function cryptoHash<T>(...inputs: Array<T>) {
  const hash = createHash("sha256");

  hash.update(inputs.sort().join(" "));

  return hash.digest("hex");
}
