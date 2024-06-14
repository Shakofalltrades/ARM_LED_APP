const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 8080;

const server = app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });
const nodeIdMap = new Map();

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    // Try to parse the message as JSON
    try {
      const data = JSON.parse(message);

      // Handle new connection event
      if (data.event === 'newConnection' && data.nodeId) {
        console.log(`New node connected: ${data.nodeId}`);
        nodeIdMap.set(ws, data.nodeId);

        // Notify all clients about the new connection
        const newConnectionMessage = JSON.stringify({ event: 'newConnection', nodeId: data.nodeId });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(newConnectionMessage);
          }
        });
      }

      // Handle node disconnected event
      if (data.event === 'nodeDisconnected' && data.nodeId) {
        console.log(`Node disconnected: ${data.nodeId}`);

        // Notify all clients about the disconnection
        const nodeDisconnectedMessage = JSON.stringify({ event: 'nodeDisconnected', nodeId: data.nodeId });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(nodeDisconnectedMessage);
          }
        });

        // Find the WebSocket associated with this nodeId and remove it
        for (let [client, id] of nodeIdMap.entries()) {
          if (id === data.nodeId) {
            nodeIdMap.delete(client);
            break;
          }
        }
      }

      // Handle single character commands
      if (data.command === 's' || data.command === 'a' || data.command === 't' || data.command === 'r' || data.command === 'p') {
        console.log(`Command received: ${data.command}`);
        // Broadcast the command to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ command: data.command, nodeId: data.nodeId }));
          }
        });
        return;
      }

      // Check if the data contains temperature and/or humidity
      if (data.temperature !== undefined || data.humidity !== undefined) {
        const broadcastData = {
          nodeId: data.nodeId
        };

        if (data.temperature !== undefined) {
          broadcastData.temperature = data.temperature;
        }
        if (data.humidity !== undefined) {
          broadcastData.humidity = data.humidity;
        }

        // Broadcast the data to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(broadcastData));
          }
        });
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');

    // Get the nodeId associated with this WebSocket
    const disconnectedNodeId = nodeIdMap.get(ws);

    if (disconnectedNodeId) {
      // Notify all clients about the disconnection
      const nodeDisconnectedMessage = JSON.stringify({ event: 'nodeDisconnected', nodeId: disconnectedNodeId });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(nodeDisconnectedMessage);
        }
      });

      // Remove the nodeId from the map
      nodeIdMap.delete(ws);
    }
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
