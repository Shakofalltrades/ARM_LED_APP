// HomePage.js
import React from "react";
import "./HomePage.css";

function HomePage({ setActivePage }) {
  return (
    <div className="home-container">
      <h1>Welcome to LUMNET Control Panel</h1>
      <div className="home-buttons">
        <button className="home-button" onClick={() => setActivePage("SensorMonitoring")}>
          Node Control
        </button>
        <button className="home-button" onClick={() => setActivePage("Sketchpad")}>
          Animation Sketchpad
        </button>
      </div>
    </div>
  );
}

export default HomePage;
