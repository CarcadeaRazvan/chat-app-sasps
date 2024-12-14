const http = require("http");
const { createClient } = require("redis");

// Use environment variables or defaults
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;

const CHANNEL = "chat_channel";

(async () => {
  console.log(`Connecting to Redis at redis://${redisHost}:${redisPort}`);
  const publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });
  try {
    await publisher.connect();
    console.log("Connected to Redis successfully!");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
    process.exit(1);
  }

  const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/publish") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          console.log(`Received payload: ${body}`);
          const { username, content } = JSON.parse(body);

          const messageWithTimestamp = JSON.stringify({
            username,
            content,
            timestamp: Date.now(),
            type: "message",
          });
          console.log(`Publishing to Redis: ${messageWithTimestamp}`);
          await publisher.publish(CHANNEL, messageWithTimestamp);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ status: "ok", message: "Message published" })
          );
        } catch (error) {
          console.error("Error processing request:", error);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "error", message: error.message }));
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "not_found" }));
    }
  });

  const PORT = process.env.HTTP_GATEWAY_PORT || 3000;
  server.listen(PORT, () => {
    console.log(`HTTP gateway for Pub/Sub running on port ${PORT}`);
  });
})();
