module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/prefer-interface": 1,
    "@typescript-eslint/explicit-function-return-type": false
  }
};
