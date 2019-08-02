import { createHash } from "crypto";

function cryptoHash(...inputs: Array<any>) {
  const hash = createHash("sha256");

  hash.update(
    inputs
      .map(el => JSON.stringify(el))
      .sort()
      .join(" ")
  );

  return hash.digest("hex");
}

export { cryptoHash };
