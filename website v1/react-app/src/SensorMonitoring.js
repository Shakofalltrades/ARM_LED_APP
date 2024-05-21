// SensorMonitoring.js
import React, { useState } from "react";
import "./SensorMonitoring.css";

function SensorMonitoring({ setActivePage }) {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="sensor-monitoring-container">
      <nav>
        <button onClick={() => setActiveSection("Temperature")}>Temperature</button>
        <button onClick={() => setActiveSection("Motion")}>Motion</button>
        <button onClick={() => setActiveSection("Humidity")}>Humidity</button>
      </nav>
      {activeSection === null && <h2>Select a sensor to monitor</h2>}
      {activeSection === "Temperature" && (
        <section>
          <h2>Temperature</h2>
          <p>The temperature is 25ºC.</p>
          <button className="reset-button" onClick={() => setActiveSection("reset")}>Reset</button>
        </section>
      )}
      {activeSection === "Motion" && (
        <section>
          <h2>Motion</h2>
          <p>There is no motion detected.</p>
          <button className="reset-button" onClick={() => setActiveSection("reset")}>Reset</button>
        </section>
      )}
      {activeSection === "Humidity" && (
        <section>
          <h2>Humidity</h2>
          <p>There is a low humidity.</p>
          <button className="reset-button" onClick={() => setActiveSection("reset")}>Reset</button>
        </section>
      )}
      {activeSection === "reset" && (
        <section>
          <h2>No sensor is being read</h2>
          <button className="reset-button" onClick={() => setActiveSection("reset")}>Reset</button>
        </section>
      )}
      <button className="back-button" onClick={() => setActivePage("Home")}>Return to Home Page</button>
    </div>
  );
}

export default SensorMonitoring;
