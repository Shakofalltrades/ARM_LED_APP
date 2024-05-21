import React, { useState } from "react";
import "./App.css";
import Header from "./Header";
import Footer from "./Footer";
import HomePage from "./HomePage";
import SensorMonitoring from "./SensorMonitoring";
import Sketchpad from "./Sketchpad";

function App() {
  const [activePage, setActivePage] = useState("Home");

  let content;
  if (activePage === "Home") {
    content = <HomePage setActivePage={setActivePage} />;
  } else if (activePage === "SensorMonitoring") {
    content = <SensorMonitoring setActivePage={setActivePage} />;
  } else if (activePage === "Sketchpad") {
    content = <Sketchpad setActivePage={setActivePage} />;
  }

  return (
    <div className="App">
      <Header />
      {content}
      <Footer />
    </div>
  );
}

export default App;
