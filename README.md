# Duke JS Client

A lightweight JavaScript client for interacting with a Duke distributed key-value cluster.

## Installation
```bash
npm install duke-client
```
## Usage

### Create a Client

```js
const duke = new Duke();
```

### Add Duke Nodes

```js
duke.seturl(
  "duke://localhost:8000",
  "duke://localhost:8001",
  "duke://localhost:8002",
);
```

Multiple URLs can be provided.

### Connect

Before performing any operations, call `connect()`.

```js
const connected = await duke.connect();

if (!connected) {
  console.log("No healthy Duke nodes found.");
}
```

The client checks the health of all configured nodes and stores only healthy ones for future requests.

---

## PUT

Store a key-value pair.

```js
await duke.PUT("name", "Duke");
```

Returns:

```js
true;
```

---

## GET

Retrieve a value by key.

```js
const value = await duke.GET("name");

console.log(value);
```

Output:

```txt
Duke
```

If the key does not exist:

```js
Error: Key not found.
```

---

## Health Checking

### The client verifies node health using db.checkHealth()

## Example

```js
import Duke from "duke-client";

const duke = new Duke();

duke.seturl(
  "duke://localhost:8000",
  "duke://localhost:8001",
  "duke://localhost:8002",
);

const connected = await duke.connect();

if (!connected) {
  throw new Error("No Duke nodes available.");
}

await duke.PUT("username", "baltej");

const value = await duke.GET("username");

console.log(value);
```
## Batched PUTs/GETs
### fn: batch_PUT(keyArr:Array<String>, valueArr:Array<String>, batch_size:Number)
```js
 const result = await db.batch_PUT(keys, vals, 1000);
```
### fn: batch_GET(keyArr:Array<String>, batch_size:Number)
```js
 const result = await db.batch_GET(keys, 1000);
```
For key not found, it will print an error; "KeyNotFound".
---

