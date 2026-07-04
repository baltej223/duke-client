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

for (let i = 0; i < 1000; i++) {
  keys.push(`key-${i}`);
  vals.push(`val-${i}`);
}

const doPut = process.argv.includes("--put");

if (doPut) {
  console.time("Batch PUT time");
  const result = await db.batch_PUT(keys, vals, 1000);
  console.timeEnd("Batch PUT time");
  console.log(result.length);
} else {
  console.time("Batch GET time");
  const result = await db.batch_GET(keys, 1000);
  console.timeEnd("Batch GET time");
  console.log(result.length);
}
