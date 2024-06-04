import React, { useState } from "react";
import "./App.css";
import Header from "./Header";
import Footer from "./Footer";
import HomePage from "./HomePage";
import SensorMonitoring from "./SensorMonitoring";
import Sketchpad from "./Sketchpad";
import AnimationDisplay from "./AnimationDisplay";

function App() {
  const [activePage, setActivePage] = useState("Home");
  const [animationFrames, setAnimationFrames] = useState([]);
  const [animationName, setAnimationName] = useState(""); // New state for animation name

  console.log("Rendering App component");
  console.log("activePage:", activePage);
  console.log("setActivePage:", setActivePage);

  let content;
  if (activePage === "Home") {
    content = <HomePage setActivePage={setActivePage} />;
  } else if (activePage === "SensorMonitoring") {
    content = <SensorMonitoring setActivePage={setActivePage} />;
  } else if (activePage === "Sketchpad") {
    content = <Sketchpad setActivePage={setActivePage} setAnimationFrames={setAnimationFrames} setAnimationName={setAnimationName} />; // Pass setAnimationName
  } else if (activePage === "AnimationDisplay") {
    content = <AnimationDisplay setActivePage={setActivePage} frames={animationFrames} animationName={animationName} />; // Pass animationName
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
