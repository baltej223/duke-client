function dukeToHttp(url) {
  return url.replace("duke://", "http://");
}

export default class Duke {
  constructor() {
    this.baseObject = {
      baseURLs: [],
      workingURLs: [],
    };
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
      );

      const data = await response.text();

      return data === "OK";
    } catch {
      return false;
    }
  }

  async connect() {
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

    return healthy > 0;
  }

  async GET(key) {
    this.check();

    const url = dukeToHttp(
      this.chooseRandomWorkingUrl(),
    );

    console.log(`${url}/get?key=${encodeURIComponent(key)}`);
    const response = await fetch(`${url}/get?key=${encodeURIComponent(key)}`);

    const data = await response.json();

    if (data.found) {
      return data.value;
    }

    throw new Error(data.error || "Key not found.");
  }

  async PUT(key, value) {
    this.check();

    const url = dukeToHttp(this.chooseRandomWorkingUrl());

    const response = await fetch(`${url}/put`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          key,
          value,
        }),
      },
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "PUT failed.");
    }

    return true;
  }
}
