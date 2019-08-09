import { TransactionPool } from "../Wallet/TransactionPool/";
import { Wallet } from "../Wallet/";
import * as fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { Blockchain } from "../Blockchain";
import { PubSub } from "../Pubsub";
import * as request from "request";
import { TransactionMiner } from "../TransactionMiner";
import { appendFile } from "fs";

/*
 * TODO: change http client
 */

const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub
});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

server.get("/api/blocks", (_, res) => {
  res.send(blockchain.chain);
});

server.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  res.redirect("/api/blocks");
});

server.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;

  try {
    let transaction = transactionPool.getExistingTransaction({
      inputAddress: wallet.getPublicKey()
    });

    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain
      });
    }
    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.status(200).send({ transaction });
  } catch (error) {
    res.status(400).send({ errorCode: Number(error.message) });
  }
});

server.get("/api/transaction-pool-map", (req, res) => {
  res.send(transactionPool.getTransactionMap());
});

const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, resp, body) => {
    if (!error && resp.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log("replace chain on a sync with", rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction/pool-map` },
    (error, resp, body) => {
      if (!error && resp.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log(
          "replace rootTransactionPoolMap on a sync with",
          rootTransactionPoolMap
        );

        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

server.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTransactions();

  res.redirect("/api/blocks");
});

server.get("/api/wallet-info", (req, res) => {
  const address = wallet.getPublicKey() as string;
  res.send({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain.getChain(),
      address
    })
  });
});

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
server.listen(PORT, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  server.log.info(`server listening on ${address}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
