const { createClient } = require('redis');
const readline = require('readline');

// Create Redis clients for publishing and subscribing
const publisher = createClient();
const subscriber = createClient();

// Define the Redis channel to use for the chat
const CHANNEL = 'chat_channel';

// Function to handle the setup
async function setup() {
  await publisher.connect();
  await subscriber.connect();

  // Prompt the user for a non-empty username
  let username = '';
  while (!username) {
    username = await new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("Enter your username: ", (name) => {
        rl.close();
        resolve(name.trim());
      });
    });
    if (!username) {
      console.log("Username cannot be empty. Please enter a valid username.");
    }
  }

  // Subscribe to the chat channel
  await subscriber.subscribe(CHANNEL, (message) => {
    const { username: senderUsername, content, timestamp, type } = JSON.parse(message);
    const timeString = new Date(timestamp).toLocaleTimeString();
    const receivedTime = Date.now();
    const latency = receivedTime - timestamp;

    if (type === 'join' && senderUsername === username) return; // Ignore join message from self
    if (type === 'leave' && senderUsername === username) return; // Ignore leave message from self

    // Display join/leave messages differently
    if (type === 'join') {
      console.log(`[${timeString}] Server: ${senderUsername} has joined the chat.`);
    } else if (type === 'leave') {
      console.log(`[${timeString}] Server: ${senderUsername} has left the chat.`);
    } else {
      // Display regular chat messages
      console.log(`[${timeString} ${latency}ms] ${senderUsername}: ${content}`);
    }
  });

  console.log(`Welcome to the chat, ${username}! You are now subscribed to ${CHANNEL}`);

  // Notify other clients that this user has joined
  await publisher.publish(CHANNEL, JSON.stringify({
    username,
    content: `${username} has joined the chat.`,
    timestamp: Date.now(),
    type: 'join',
  }));

  // Setup readline interface for sending messages
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Handle sending messages
  rl.on('line', async (input) => {
    const messageWithTimestamp = JSON.stringify({
      username,
      content: input,
      timestamp: Date.now(),
      type: 'message',
    });

    await publisher.publish(CHANNEL, messageWithTimestamp);
  });

  // Handle client exit and notify others
  rl.on('SIGINT', async () => {
    console.log("\nDisconnecting from the chat...");

    // Notify others that this user has left
    await publisher.publish(CHANNEL, JSON.stringify({
      username,
      content: `${username} has left the chat.`,
      timestamp: Date.now(),
      type: 'leave',
    }));

    await publisher.quit();
    await subscriber.quit();
    process.exit(0);
  });
}

// Run the setup function
setup().catch(console.error);
