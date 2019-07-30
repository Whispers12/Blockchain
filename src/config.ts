const INITIAL_DIFFICULTY = 3;

/**
 * its data needed for first block in blockchain
 */
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

export { GENESIS_DATA, INITIAL_DIFFICULTY };
