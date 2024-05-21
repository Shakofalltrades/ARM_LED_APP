// HomePage.js
import React from "react";
import "./HomePage.css";

function HomePage({ setActivePage }) {
  return (
    <div className="home-container">
      <h1>Welcome to ARM Mesh Wireless Network</h1>
      <div className="home-buttons">
        <button className="home-button" onClick={() => setActivePage("SensorMonitoring")}>
          Sensor Monitoring
        </button>
        <button className="home-button" onClick={() => setActivePage("Sketchpad")}>
          Sketchpad
        </button>
      </div>
    </div>
  );
}

export default HomePage;
