const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const STARTING_BALANCE = 1000;
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

export { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };
