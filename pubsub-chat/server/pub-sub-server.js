const { createClient } = require("redis");

// Use environment variables or defaults
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;

const CHANNEL = "chat_channel";

async function startServer() {
  const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
  await subscriber.connect();

  console.log(
    `Pub/Sub Server is running and subscribed to "${CHANNEL}". Waiting for messages...`
  );

  await subscriber.subscribe(CHANNEL, (rawMessage) => {
    const { username, content, timestamp, type } = JSON.parse(rawMessage);
    const timeString = new Date(timestamp).toLocaleTimeString();

    if (type === "join") {
      console.log(`[${timeString}] INFO: User "${username}" joined the chat.`);
    } else if (type === "leave") {
      console.log(`[${timeString}] INFO: User "${username}" left the chat.`);
    } else if (type === "message") {
      console.log(`[${timeString}] ${username}: ${content}`);
    } else {
      console.log(`[${timeString}] Unrecognized message type:`, rawMessage);
    }
  });
}

startServer().catch(console.error);
