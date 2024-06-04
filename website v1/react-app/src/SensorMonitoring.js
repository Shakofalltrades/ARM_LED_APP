import React, { useState, useEffect, useRef } from "react";
import "./SensorMonitoring.css";

function SensorMonitoring({ setActivePage }) {
  const [numNodes, setNumNodes] = useState(1);
  const [nodes, setNodes] = useState(Array(1).fill({ section: null, data: null }));
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'temperature') {
        setNodes((prevNodes) => prevNodes.map((node) => 
          node.section === 'Temperature' ? { ...node, data: message.value } : node
        ));
      }
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
    setNodes(Array(value).fill({ section: null, data: null }));
  };

  const handleSectionChange = (index, section) => {
    const newNodes = nodes.map((node, i) => (i === index ? { ...node, section, data: null } : node));
    setNodes(newNodes);
  };

  const handleReset = () => {
    setNodes(Array(numNodes).fill({ section: null, data: null }));
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
          </tr>
        </thead>
        <tbody>
          {nodes.map((node, index) => (
            <tr key={index}>
              <td>Node {index + 1}</td>
              <td>
                <nav>
                  <button className="sensor-button" onClick={() => handleSectionChange(index, "Temperature")}>Temperature</button>
                  <button className="sensor-button" onClick={() => handleSectionChange(index, "Motion")}>Motion</button>
                  <button className="sensor-button" onClick={() => handleSectionChange(index, "Humidity")}>Humidity</button>
                </nav>
              </td>
              <td>
                {node.section === "Temperature" && <p>{node.data !== null ? `The temperature is ${node.data}ºC.` : "Loading..."}</p>}
                {node.section === "Motion" && <p>There is no motion detected.</p>}
                {node.section === "Humidity" && <p>There is a low humidity.</p>}
                {node.section === null && <p>No sensor selected.</p>}
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
