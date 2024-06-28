import React, { useState } from "react";
import "./App.css";
import Header from "./Header";
import HomePage from "./HomePage";
import SensorMonitoring from "./SensorMonitoring";
import Sketchpad from "./Sketchpad";
import AnimationDisplay from "./AnimationDisplay";

function App() {
  const [activePage, setActivePage] = useState("Home");
  const [animationFrames, setAnimationFrames] = useState([]);
  const [animationName, setAnimationName] = useState("");

  let content;
  if (activePage === "Home") {
    content = <HomePage setActivePage={setActivePage} />;
  } else if (activePage === "SensorMonitoring") {
    content = <SensorMonitoring setActivePage={setActivePage} />;
  } else if (activePage === "Sketchpad") {
    content = (
      <Sketchpad 
        setActivePage={setActivePage} 
        setAnimationFrames={setAnimationFrames} 
        setAnimationName={setAnimationName} 
      />
    );
  } else if (activePage === "AnimationDisplay") {
    content = (
      <AnimationDisplay 
        setActivePage={setActivePage} 
        animationFrames={animationFrames} 
        animationName={animationName} 
      />
    );
  }

  return (
    <div className="App">
      <Header />
      {content}
      
    </div>
  );
}

export default App;
