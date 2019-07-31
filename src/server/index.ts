import * as fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { Blockchain } from "../Blockchain";

const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});
const blockchain = new Blockchain();

server.get("/api/blocks", (_, res) => {
  res.send(blockchain.chain);
});

server.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  res.redirect("/api/blocks");
});

server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`server listening on ${address}`);
});
