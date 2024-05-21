// MainContent.js
import React from "react";
import Sketchpad from "./Sketchpad";

function MainContent({ activeSection, setActiveSection }) {
  return (
    <main>
      <nav>
        <button onClick={() => setActiveSection("Temperature")}>Temperature</button>
        <button onClick={() => setActiveSection("Motion")}>Motion</button>
        <button onClick={() => setActiveSection("Humidity")}>Humidity</button>
        <button onClick={() => setActiveSection("Sketchpad")}>Sketchpad</button>
      </nav>
      {activeSection === null && <h2>Welcome!</h2>}
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
      {activeSection === "Sketchpad" && (
        <section>
          <Sketchpad />
        </section>
      )}
      {activeSection === "reset" && (
        <section>
          <h2>No sensor is being read</h2>
          <button className="reset-button" onClick={() => setActiveSection("reset")}>Reset</button>
        </section>
      )}
    </main>
  );
}

export default MainContent;
