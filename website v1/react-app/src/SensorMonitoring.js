import React, { useState, useEffect, useRef } from "react";
import "./SensorMonitoring.css";

function SensorMonitoring({ setActivePage }) {
  const [numNodes, setNumNodes] = useState(1);
  const [nodes, setNodes] = useState(Array(1).fill({ section: null, data: null, nodeId: null }));
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      const message = JSON.parse(event.data);

      setNodes((prevNodes) => {
        const nodeIndex = prevNodes.findIndex((node) => node.nodeId === message.nodeId);
        if (nodeIndex !== -1) {
          const updatedNodes = [...prevNodes];
          let data = updatedNodes[nodeIndex].data;
          if (updatedNodes[nodeIndex].section === 'Temperature' && message.temperature !== undefined) {
            data = `The temperature is ${message.temperature}ºC.`;
          } else if (updatedNodes[nodeIndex].section === 'Humidity' && message.humidity !== undefined) {
            data = `The humidity is ${message.humidity}%.`;
          }
          updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], data, nodeId: message.nodeId };
          return updatedNodes;
        } else {
          return prevNodes.map((node, index) => {
            if (node.nodeId === null) {
              let data = node.data;
              if (node.section === 'Temperature' && message.temperature !== undefined) {
                data = `The temperature is ${message.temperature}ºC.`;
              } else if (node.section === 'Humidity' && message.humidity !== undefined) {
                data = `The humidity is ${message.humidity}%.`;
              }
              return { ...node, data, nodeId: message.nodeId };
            }
            return node;
          });
        }
      });
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleNumNodesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumNodes(value);
    setNodes(Array(value).fill({ section: null, data: null, nodeId: null }));
  };

  const handleSectionChange = (index, section) => {
    const newNodes = nodes.map((node, i) => (i === index ? { ...node, section, data: null } : node));
    setNodes(newNodes);
  };

  const handleReset = () => {
    setNodes(Array(numNodes).fill({ section: null, data: null, nodeId: null }));
  };

  const handleSendCommand = (command) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ command }));
    }
  };

  return (
    <div className="sensor-monitoring-container">
      <div className="input-container">
        <label htmlFor="numNodes">Number of Nodes:</label>
        <input
          type="number"
          id="numNodes"
          min="1"
          value={numNodes}
          onChange={handleNumNodesChange}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Sensor Type</th>
            <th>Sensor Data</th>
            <th>Controls</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node, index) => (
            <tr key={index}>
              <td>
                {node.nodeId ? `Node ID: ${node.nodeId}` : `Node ${index + 1}`}
              </td>
              <td>
                <nav>
                  <button className="sensor-button" onClick={() => handleSectionChange(index, "Temperature")}>Temperature</button>
                  <button className="sensor-button" onClick={() => handleSectionChange(index, "Humidity")}>Humidity</button>
                </nav>
              </td>
              <td>
                {node.section === "Temperature" && <p>{node.data !== null ? node.data : "Loading..."}</p>}
                {node.section === "Humidity" && <p>{node.data !== null ? node.data : "Loading..."}</p>}
                {node.section === null && <p>No sensor selected.</p>}
              </td>
              <td>
                <button className="control-button" onClick={() => handleSendCommand('p')}>Pause</button>
                <button className="control-button" onClick={() => handleSendCommand('r')}>Resume</button>
                <button className="control-button" onClick={() => handleSendCommand('t')}>Toggle</button>
                <button className="control-button" onClick={() => handleSendCommand('s')}>Sensor</button>
                <button className="control-button" onClick={() => handleSendCommand('a')}>Animate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="reset-button" onClick={handleReset}>Reset All</button>
      <button className="back-button" onClick={() => setActivePage("Home")}>Return to Home Page</button>
    </div>
  );
}

export default SensorMonitoring;
