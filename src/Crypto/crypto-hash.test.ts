import { cryptoHash } from "./cryptoHash";

describe("crypto hash", () => {
  it("should generate a SHA-256 output", () => {
    expect(cryptoHash("foo")).toEqual(
      "b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b"
    );
  });

  it("should produce the same hash with the same input arguments", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two")
    );
  });

  it("should produces a unique hash when the properties have changed on input", () => {
    const foo: { a?: string } = {};
    const originalHash = cryptoHash(foo);

    foo.a = "a";

    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
