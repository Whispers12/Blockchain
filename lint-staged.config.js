module.exports = {
  "**/*.ts?(x)": [
    () => "tsc -p tsconfig.json --noEmit",
    "cross-env NODE_ENV=test jest --bail --findRelatedTests",
    "git add"
  ],
  "*.json": ["prettier --write", "git add"]
};
