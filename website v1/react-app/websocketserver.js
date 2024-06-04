const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = 8080;

// Start the HTTP server on the specified port
const server = app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    try {
      const data = JSON.parse(message);
      console.log(`Temperature: ${data.temperature} °C, Humidity: ${data.humidity} %`);
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
