import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Sketchpad.css";

const Sketchpad = ({ setActivePage }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [grid, setGrid] = useState(Array(16).fill().map(() => Array(16).fill("#ffffff")));
  const [filled, setFilled] = useState(Array(16).fill().map(() => Array(16).fill(false)));
  const [frames, setFrames] = useState([]);
  const navigate = useNavigate();

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
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const cellSize = canvas.width / 16;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
    setFrames([]); // Clear the frames array
    clearSketchpad();
  };

  const handleColorChange = (e) => {
    setPenColor(e.target.value);
    setIsErasing(false); // Ensure eraser is turned off when color is selected
  };

  const handleBackgroundColorChange = (e) => {
    const newBackgroundColor = e.target.value;
    setBackgroundColor(newBackgroundColor);
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => filled[rowIndex][colIndex] ? cell : newBackgroundColor)
    );
    setGrid(newGrid);
  };

  const doneDrawing = () => {
    const frame = generateImage();
    setFrames([...frames, frame]);
    downloadFrame(frame, `drawing-${frames.length + 1}.png`);
  };

  const generateImage = () => {
    const resizedCanvas = document.createElement("canvas");
    const resizedContext = resizedCanvas.getContext("2d");

    resizedCanvas.width = 16;
    resizedCanvas.height = 16;

    // Draw the grid onto the resized canvas
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        resizedContext.fillStyle = grid[row][col];
        resizedContext.fillRect(col, row, 1, 1);
      }
    }

    // Create a data URL from the resized canvas
    return resizedCanvas.toDataURL("image/png");
  };

  const downloadFrame = (frame, filename) => {
    const link = document.createElement("a");
    link.href = frame;
    link.download = filename;

    // Append the link to the body, click it to trigger download, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFrames = () => {
    frames.forEach((frame, index) => {
      downloadFrame(frame, `animation-frame-${index + 1}.png`);
    });
  };

  const animateAndNavigate = () => {
    downloadAllFrames();
    navigate("/animation", { state: { frames } });
  };

  return (
    <div className="sketchpad-container">
      <div className="sketchpad-content">
        <canvas
          ref={canvasRef}
          width="320"
          height="320"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
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
