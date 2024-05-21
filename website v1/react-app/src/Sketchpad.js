import React, { useRef, useState, useEffect, useCallback } from "react";
import "./Sketchpad.css";

const Sketchpad = ({ setActivePage }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [grid, setGrid] = useState(Array(16).fill().map(() => Array(16).fill("#ffffff")));
  const [filled, setFilled] = useState(Array(16).fill().map(() => Array(16).fill(false)));

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

    const newGrid = [...grid];
    const newFilled = [...filled];
    newGrid[row][col] = isErasing ? backgroundColor : penColor;
    newFilled[row][col] = !isErasing;
    setGrid(newGrid);
    setFilled(newFilled);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const clearCanvas = () => {
    setGrid(Array(16).fill().map(() => Array(16).fill(backgroundColor)));
    setFilled(Array(16).fill().map(() => Array(16).fill(false)));
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
    generateAndDownloadImage();
  };

  const generateAndDownloadImage = () => {
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
    const dataURL = resizedCanvas.toDataURL("image/png");

    // Create a link element for downloading
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing-16x16.png";

    // Append the link to the body, click it to trigger download, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <li>When your drawing is complete, click Done</li>
            <li>Click Download to save a 16x16 PNG of your drawing</li>
          </ol>
          <div className="instruction-buttons">
            <button className="button" onClick={doneDrawing}>Done</button>
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
        <input
          type="color"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
          title="Choose background color"
        />
        <button className="button" onClick={toggleEraser}>
          {isErasing ? "Switch to Pen" : "Switch to Eraser"}
        </button>
        <button className="button" onClick={clearCanvas}>Clear</button>
      </div>
      <button className="home-button" onClick={() => setActivePage("Home")}>
        Return to Home Page
      </button>
    </div>
  );
};

export default Sketchpad;
