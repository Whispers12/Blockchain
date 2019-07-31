import { Blockchain } from "../Blockchain";
import { last } from "../utils/last";

const blockchain = new Blockchain();

blockchain.addBlock({ data: "initial" });

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 10000; i++) {
  prevTimestamp = last(blockchain.chain).timestamp;

  blockchain.addBlock({ data: `block ${i}` });
  nextBlock = last(blockchain.chain);

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((total, num) => total + num, 0) / times.length;

  console.log(
    `Time to mine block: ${timeDiff}ms. Difficulty: ${
      nextBlock.difficulty
    }. Average time: ${average}ms.`
  );
}
