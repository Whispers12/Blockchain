import * as fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { Blockchain } from "../Blockchain";

const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});
const blockchain = new Blockchain();

server.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});
