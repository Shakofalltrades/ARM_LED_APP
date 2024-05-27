import React, { useEffect, useRef, useState } from "react";
import "./AnimationDisplay.css";

const AnimationDisplay = ({ setActivePage, frames }) => {
  const canvasRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    let frameIndex = 0;

    const drawFrame = () => {
      if (isPaused) return;
      const img = new Image();
      img.src = frames[frameIndex];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      frameIndex = (frameIndex + 1) % frames.length;
    };

    const id = setInterval(drawFrame, 120); // 120ms per frame
    setIntervalId(id);

    return () => clearInterval(id);
  }, [frames, isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const returnToSketchpad = () => {
    clearInterval(intervalId);
    setActivePage("Sketchpad");
  };

  return (
    <div className="animation-page">
      <header className="animation-header">Animation Display</header>
      <div className="animation-container">
        <canvas
          ref={canvasRef}
          width="16"
          height="16"
          style={{ width: "320px", height: "320px" }}
        ></canvas>
        <p>Here is your animation</p>
        <button className="button" onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button className="button" onClick={returnToSketchpad}>
          Return to Sketchpad
        </button>
      </div>
      <footer className="animation-footer">Footer Content Here</footer>
    </div>
  );
};

export default AnimationDisplay;
