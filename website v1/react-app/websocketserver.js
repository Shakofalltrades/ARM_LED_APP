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
    const messageString = message.toString(); // Convert Buffer to string
    console.log(`Received: ${messageString}`);

    // Split the message by newlines to handle multiple JSON objects in one message
    const messages = messageString.split('\n').filter(msg => msg.trim());

    messages.forEach((msg) => {
      try {
        const data = JSON.parse(msg);

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
        if (['s', 'a', 't', 'r', 'p', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'].includes(data.command)) {
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
            nodeId: data.nodeId,
            temperature: data.temperature,
            humidity: data.humidity
          };

          // Broadcast the data to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastData));
            }
          });
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.log('Received non-JSON message:', msg);
      }
    });
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
