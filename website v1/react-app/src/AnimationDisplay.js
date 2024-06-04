import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import "./AnimationDisplay.css";

const AnimationDisplay = ({ setActivePage, frames, animationName }) => {
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

    let id;
    if (frames.length > 0) {
      id = setInterval(drawFrame, 120); // 120ms per frame
      setIntervalId(id);
    }

    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [frames, isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const returnToSketchpad = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setActivePage("Sketchpad");
  };

  return (
    <div className="animation-page">
      <header className="animation-header">Animation Display</header>
      <h2>{animationName}</h2> {/* Display the animation name */}
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

AnimationDisplay.propTypes = {
  setActivePage: PropTypes.func.isRequired,
  frames: PropTypes.array.isRequired,
  animationName: PropTypes.string.isRequired, // Add prop type for animation name
};

export default AnimationDisplay;
