import { createHash } from "crypto";

function cryptoHash(...inputs: Array<any>) {
  const hash = createHash("sha256");

  hash.update(inputs.sort().join(" "));

  return hash.digest("hex");
}

export { cryptoHash };
