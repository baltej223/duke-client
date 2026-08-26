import Duke from "./duke.js";

const db = new Duke();

db.seturl(
  "duke://localhost:9000",
  "duke://localhost:9001",
  "duke://localhost:9002",
  "duke://localhost:9003",
  "duke://localhost:9004",
  "duke://localhost:9005",
  "duke://localhost:9006"
);

await db.connect();

const keys = [];
const vals = [];

for (let i = 0; i < 10000; i++) {
  keys.push(`key-${i}`);
  vals.push(`val-${i}`);
}

db.debug(false);

const doPut = process.argv.includes("--put");


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let i =0;

if (doPut) {
  console.time("Batch PUT time");
  const result = await db.batch_PUT(keys, vals, 100);
  if(i%10 == true) {
	console.log(i, " Done \n");
  } 
	console.timeEnd("Batch PUT time");
  console.log(result.length);
} else {
  console.time("Batch GET time");
  const result = await db.batch_GET(keys, 1);
  console.timeEnd("Batch GET time");
}
// If another node is down, it sends that message to client, and client thinks that the current node is down, and rmoves it from pool
