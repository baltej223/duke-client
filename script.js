import Duke from "./duke.js"
import process from "process"

const db = new Duke();

db.seturl(
  "duke://localhost:9000",
  "duke://localhost:9001",
  "duke://localhost:9002",
  "duke://localhost:9003",
  "duke://localhost:9004",
  "duke://localhost:9005",
  "duke://localhost:9006",
  "duke://localhost:9007",
  "duke://localhost:9008",
  "duke://localhost:9009",
)


await db.connect()
//
// console.time("10000 Puts in duke:");
// for (let i = 0; i < 10000; ++i) {
//   try {
//     await db.PUT("key-i-" + i, "data-i-" + i)
//     if (!(i % 1000)) {
//       console.log("Inserted values till ", i);
//     }
//   }
//   catch (e) {
//     console.log(e);
//     process.exit(1);
//   }
// }
// console.timeEnd("10000 Puts in duke:");


//
// console.time("10000 GETs from duke:");
// for (let i = 0; i < 10000; ++i) {
//   try {
//     let value = await db.GET("key-i-" + i)
//     if (!(i % 1000)) {
//       console.log("GET values till ", i);
//     }
//   }
//   catch (e) {
//     console.log(e);
//     process.exit(1);
//   }
// }
// console.timeEnd("10000 GETs from duke:");


// const promises = [];
//
/// for (let i = 0; i < 10000; i++) {
//   promises.push(
//     db.PUT(`key-${i}`, `value-${i}`)
//   );
// }
//
// await Promise.all(promises);
///
//
// const BATCH_SIZE = 100;
//
// console.time("Batch PUT time:");
// for (let i = 0; i < 10000; i += BATCH_SIZE) {
//   const batch = [];
//
//   for (let j = i; j < i + BATCH_SIZE; j++) {
//     batch.push(
//       db.PUT(`key-${j}`, `value-${j}`)
//     );
//   }
//
//   await Promise.all(batch);
// }
// console.timeEnd("Batch PUT time:");



const BATCH_SIZE = 100;

console.time("Batch GET time:");

for (let i = 0; i < 10000; i += BATCH_SIZE) {
  const batch = [];

  for (let j = i; j < i + BATCH_SIZE; j++) {
    batch.push(
      db.GET(`key-${j}`)
    );
  }

  await Promise.all(batch);
}

console.timeEnd("Batch GET time:");
