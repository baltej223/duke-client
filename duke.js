function dukeToHttp(url) {
  return url.replace("duke://", "http://");
}

export default class Duke {
  constructor() {
    this.baseObject = {
      baseURLs: [],
      workingURLs: [],
      debugMode: false,
    };
  }

  debug(bool = false) {
    this.baseObject.debugMode = bool;
  }

  seturl(...urls) {
    urls.forEach((url) => {
      if (!url.startsWith("duke://")) {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    this.baseObject.baseURLs.push(...urls);
  }

  check() {
    if (this.baseObject.baseURLs.length === 0) {
      throw new Error("No URLs defined.");
    }

    if (this.baseObject.workingURLs.length === 0) {
      throw new Error(
        "No healthy Duke nodes available. Call connect() first.",
      );
    }
  }

  chooseRandomWorkingUrl() {
    const len = this.baseObject.workingURLs.length;

    if (len === 0) {
      throw new Error("No working URLs available.");
    }

    const randomIndex = Math.floor(Math.random() * len);

    const urlIndex = this.baseObject.workingURLs[randomIndex];

    return this.baseObject.baseURLs[urlIndex];
  }

  async check_health(urlIndex) {
    if (
      urlIndex < 0 ||
      urlIndex >= this.baseObject.baseURLs.length
    ) {
      throw new Error(
        "Invalid URL index provided.",
      );
    }

    try {
      const response = await fetch(
        dukeToHttp(this.baseObject.baseURLs[urlIndex]) + "/health",
        {
          verbose: this.baseObject.debugMode
        },
      );

      const data = await response.text();

      return data === "OK";
    } catch {
      return false;
    }
  }

  async connect() {
    console.log("Connecting");
    this.baseObject.workingURLs = [];

    const total =
      this.baseObject.baseURLs.length;

    let healthy = 0;

    for (let i = 0; i < total; i++) {
      const ok = await this.check_health(i);

      if (ok) {
        this.baseObject.workingURLs.push(i);
        healthy++;
      }
    }
    console.log("Connected!")
    return healthy > 0;

  }
  async GET(key) {
    this.check();

    while (this.baseObject.workingURLs.length > 0) {
      const idx = this.baseObject.workingURLs[
        Math.floor(Math.random() * this.baseObject.workingURLs.length)
      ];

      const url = dukeToHttp(this.baseObject.baseURLs[idx]);
      let data;

      try {
        const response = await fetch(
          `${url}/get?key=${encodeURIComponent(key)}`,
          {
            verbose: this.baseObject.debugMode
          },
        );
        data = await response.json();
      } catch (e) {
        // Only actual network failures (node down, connection refused) land here.
        console.log(`Node ${url} is down, removing from pool.`);
        this.baseObject.workingURLs = this.baseObject.workingURLs.filter(x => x !== idx);
        continue;
        // Loop and failover to the next node
      }

      // If we reach here, the node is healthy and responded with JSON.
      // Process business logic OUTSIDE.
      if (data.found && data.error == undefined) {
        return data.value;
      } else if (data.error != undefined) {
        if (data.error.includes("KEY NOT EXISTS") || data.error.includes("ErrKeyNotFound")) {
          throw new Error("KEY NOT EXISTS");
        } else {
          throw new Error(data.error);
        }
      }
    }

    throw new Error("No healthy nodes are left.");
  }

  async PUT(key, value) {
    this.check();

    while (this.baseObject.workingURLs.length > 0) {
      const idx = this.baseObject.workingURLs[
        Math.floor(Math.random() * this.baseObject.workingURLs.length)
      ];

      const url = dukeToHttp(this.baseObject.baseURLs[idx]);
      let data;

      try {
        const response = await fetch(`${url}/put`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, value }),
          verbose: this.baseObject.debugMode,
        });
        data = await response.json();
      } catch (e) {
        // Only actual network failures land here.
        console.log(`Node ${url} is down, removing from pool.`);
        this.baseObject.workingURLs = this.baseObject.workingURLs.filter(x => x !== idx);
        continue; // Loop and failover to the next node
      }

      // Process business logic OUTSIDE the catch block
      if (!data.success) {
        throw new Error(data.error || "PUT failed.");
      }

      return true;
    }

    throw new Error("No healthy nodes are left.");
  } async batch_GET(keysArr, BATCH_SIZE) {
    let response = [];
    for (let i = 0; i < keysArr.length; i += BATCH_SIZE) {
      let batch = [];

      for (let j = i; j < Math.min(i + BATCH_SIZE, keysArr.length); j++) {
        batch.push(
          this.GET(keysArr[j])
        );
      }
      let batch_response = await Promise.allSettled(batch);
      response.push(...batch_response)
    }
    return response
  }


  async batch_PUT(keysArr, valuesArr, BATCH_SIZE) {
    if (keysArr.length != valuesArr.length) {
      throw new Error("Different length of keys array and value arrays provided.");
    }
    let response = [];
    for (let i = 0; i < keysArr.length; i += BATCH_SIZE) {
      let batch = [];

      for (let j = i; j < Math.min(i + BATCH_SIZE, keysArr.length); j++) {
        batch.push(
          this.PUT(keysArr[j], valuesArr[j])
        );
      }
      let batch_response = await Promise.all(batch);
      response.push(...batch_response)
    }
    return response
  }

}
