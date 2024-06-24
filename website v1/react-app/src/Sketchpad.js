import React, { useRef, useState, useEffect, useCallback } from "react";
import "./Sketchpad.css";
import axios from "axios"; // Import axios for HTTP requests

const Sketchpad = ({ setActivePage, setAnimationFrames }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [grid, setGrid] = useState(Array(16).fill().map(() => Array(16).fill("#ffffff")));
  const [filled, setFilled] = useState(Array(16).fill().map(() => Array(16).fill(false)));
  const [frames, setFrames] = useState([]);
  const [message, setMessage] = useState("");
  const [animationName, setAnimationName] = useState(""); 
  const [fps, setFps] = useState(10); // New state for fps

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cellSize = canvas.width / 16;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        ctx.fillStyle = grid[row][col];
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }, [grid]);

  useEffect(() => {
    drawGrid();
  }, [grid, drawGrid]);

  const startDrawing = (e) => {
    e.preventDefault();
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const cellSize = canvas.width / 16;
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.type.includes("mouse")) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    const newGrid = grid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? (isErasing ? backgroundColor : penColor) : cell
      )
    );

    const newFilled = filled.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !isErasing : cell
      )
    );

    setGrid(newGrid);
    setFilled(newFilled);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const clearSketchpad = () => {
    setGrid(Array(16).fill().map(() => Array(16).fill(backgroundColor)));
    setFilled(Array(16).fill().map(() => Array(16).fill(false)));
  };

  const newAnimationSequence = () => {
    setFrames([]);
    clearSketchpad();
  };

  const handleColorChange = (e) => {
    setPenColor(e.target.value);
    setIsErasing(false);
  };

  const handleBackgroundColorChange = (e) => {
    const newBackgroundColor = e.target.value;
    setBackgroundColor(newBackgroundColor);
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => filled[rowIndex][colIndex] ? cell : newBackgroundColor)
    );
    setGrid(newGrid);
  };

  const doneDrawing = async () => {
    const frame = generateImage();
    setFrames([...frames, frame]);
    setMessage("Your frame has been saved!"); 
    setTimeout(() => setMessage(""), 3000); 
  };

  const generateImage = () => {
    const resizedCanvas = document.createElement("canvas");
    const resizedContext = resizedCanvas.getContext("2d");

    resizedCanvas.width = 16;
    resizedCanvas.height = 16;

    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        resizedContext.fillStyle = grid[row][col];
        resizedContext.fillRect(col, row, 1, 1);
      }
    }

    return resizedCanvas.toDataURL("image/png");
  };

  const handleNameChange = (e) => {
    setAnimationName(e.target.value);
  };

  const handleFpsChange = (e) => {
    setFps(e.target.value);
  };

  const downloadJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2); // Pretty-print JSON
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const uploadJSON = async (data) => {
    try {
      const response = await axios.post('http://localhost:4000/upload', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Upload successful', response.data);
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  const animateAndNavigate = async () => {
    if (animationName.trim() === "") {
      setMessage("Please enter a name for your animation.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const animationData = {
      name: animationName,
      fps: parseInt(fps, 10),
      images: frames.map(frame => frame.split(",")[1]), // Remove the base64 prefix
    };

    downloadJSON(animationData, `${animationName}.json`);
    await uploadJSON(animationData); // Upload the JSON data
    
    setAnimationFrames(frames); 
    setActivePage("AnimationDisplay");
  };

  return (
    <div className="sketchpad-container">
      <div className="sketchpad-content">
        <div className="message-container">
          {message && <div className="message">{message}</div>}
        </div>
        <canvas
          ref={canvasRef}
          width="320"
          height="320"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="sketchpad-canvas"
        ></canvas>
        <div className="instructions">
          <h2>Instructions:</h2>
          <ol>
            <li>Click and drag on the grid to color each pixel</li>
            <li>Choose the pen color</li>
            <li>Choose the background color</li>
            <li>When your drawing is complete, click Done to save the frame</li>
            <li>Click Animate to download all frames for animation and view animation</li>
            <li>Click Clear Sketchpad to clear the canvas</li>
            <li>Click New Animation Sequence to start a new animation sequence</li>
          </ol>
          <div className="instruction-buttons">
            <button className="button" onClick={doneDrawing}>Done</button>
            <input
              type="text"
              placeholder="Enter animation name"
              value={animationName}
              onChange={handleNameChange}
              className="animation-name-input"
            />
            <input
              type="number"
              placeholder="FPS"
              value={fps}
              onChange={handleFpsChange}
              className="fps-input"
              min="1"
            />
            <button className="button" onClick={animateAndNavigate}>Animate</button>
            <button className="button" onClick={newAnimationSequence}>New Animation Sequence</button>
          </div>
        </div>
      </div>
      <div className="controls">
        <input
          type="color"
          value={penColor}
          onChange={handleColorChange}
          title="Choose pen color"
        />
        <label>Pen Color</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
          title="Choose background color"
        />
        <label>Background Color</label>
        <button className="button" onClick={toggleEraser}>
          {isErasing ? "Switch to Pen" : "Switch to Eraser"}
        </button>
        <button className="button" onClick={clearSketchpad}>Clear Sketchpad</button>
      </div>
      <button className="home-button" onClick={() => setActivePage("Home")}>
        Return to Home Page
      </button>
    </div>
  );
};

export default Sketchpad;
