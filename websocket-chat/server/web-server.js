const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const filePath = path.join(__dirname, "..", "client", "client.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("File read error:", err);
        res.writeHead(500);
        res.end("Error loading client.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Attach WebSocket server to HTTP server
const wss = new WebSocket.Server({ server });
const clients = new Map(); // Store usernames associated with WebSocket connections

wss.on("connection", (ws) => {
  let username = null;
  let parsedData;
  ws.on("message", (data) => {
    try {
      parsedData = JSON.parse(data);
      console.log("Parsed message:", parsedData);
    } catch (e) {
      console.error("Failed to parse message:", e.message);
    }

    if (!username && parsedData.username) {
      username = parsedData.username;
      clients.set(ws, username);

      console.log(`${username} connected to the chat`);

      const joinMessage = JSON.stringify({
        username: "Server",
        message: `${username} has joined the chat.`,
        timestamp: Date.now(),
        type: "join",
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(joinMessage);
        }
      });

      return; // Exit early since this is the first message
    }

    // Handle subsequent messages
    if (username) {
      console.log(`Received message from ${username}: ${parsedData.message}`);
      const messageWithTimestamp = JSON.stringify({
        username,
        message: parsedData.message,
        timestamp: Date.now(),
        type: "message",
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageWithTimestamp);
        }
      });
    }
  });

  ws.on("close", () => {
    if (username) {
      console.log(`${username} disconnected from the chat`);
      clients.delete(ws);

      const leaveMessage = JSON.stringify({
        username: "Server",
        message: `${username} has left the chat.`,
        timestamp: Date.now(),
        type: "leave",
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(leaveMessage);
        }
      });
    }
  });
});

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
