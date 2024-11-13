const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const filePath = path.join(__dirname, '..', 'client', 'client.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('File read error:', err);
        res.writeHead(500);
        res.end('Error loading client.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Attach WebSocket server to HTTP server
const wss = new WebSocket.Server({ server });
const clients = new Map(); // Store usernames associated with WebSocket connections

wss.on('connection', (ws) => {
  let username = '';

  ws.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // If username is empty, this is the first message from this client
    if (!username && parsedData.message.includes("has joined the chat")) {
      username = parsedData.username;
      clients.set(ws, username); // Map this WebSocket connection to the username
      console.log(`${username} connected to the chat`);

      // Notify all other clients that this user has joined
      const joinMessage = JSON.stringify({
        username: 'Server',
        message: `${username} has joined the chat.`,
        timestamp: Date.now(),
        type: 'join'
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(joinMessage);
        }
      });
    } else if (username) {
      // Handle regular chat messages
      const messageWithTimestamp = JSON.stringify({
        username,
        message: parsedData.message,
        timestamp: Date.now(),
        type: 'message'
      });

      // Broadcast the chat message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageWithTimestamp);
        }
      });
    }
  });

  ws.on('close', () => {
    if (username) {
      console.log(`${username} disconnected from the chat`);
      clients.delete(ws); // Remove the user from the map on disconnection

      // Notify all other clients that the user has left the chat
      const leaveMessage = JSON.stringify({
        username: 'Server',
        message: `${username} has left the chat.`,
        timestamp: Date.now(),
        type: 'leave'
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
  console.log('Server is running on http://localhost:8080');
});
