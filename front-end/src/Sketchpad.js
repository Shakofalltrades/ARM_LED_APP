import React, { useRef, useState, useEffect, useCallback } from "react";
import "./Sketchpad.css";

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
  const [fps, setFps] = useState(10); 
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.214:8081");
    socket.onopen = () => console.log("WebSocket connection established");
    socket.onmessage = (event) => console.log("Received message:", event.data);
    socket.onclose = () => console.log("WebSocket connection closed");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    setWs(socket);
    return () => socket.close();
  }, []);

  const handleColorChange = (e) => {
    if (e.target.name === "penColor") {
      setPenColor(e.target.value);
    } else {
      const newBackgroundColor = e.target.value;
      setBackgroundColor(newBackgroundColor);
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => filled[rowIndex][colIndex] ? cell : newBackgroundColor)
      );
      setGrid(newGrid);
    }
  };

  const handleInput = (e) => {
    e.target.name === "animationName" ? setAnimationName(e.target.value) : setFps(e.target.value);
  };

  const clearSketchpad = () => {
    setGrid(Array(16).fill().map(() => Array(16).fill(backgroundColor)));
    setFilled(Array(16).fill().map(() => Array(16).fill(false)));
  };

  const newAnimationSequence = () => {
    setFrames([]);
    clearSketchpad();
  };

  const saveFrame = () => {
    const frame = generateImage();
    setFrames([...frames, frame]);
    setMessage("Your frame has been saved!");
    setTimeout(() => setMessage(""), 3000);
  };

  const finishAndSend = async () => {
    if (animationName.trim() === "") {
      setMessage("Please enter a name for your animation.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Sending 'c' to WebSocket server");
      ws.send(JSON.stringify({ command: 'c' }));
    } else {
      console.error("WebSocket connection is not open");
    }

    const animationData = {
      name: animationName,
      fps: parseInt(fps, 10),
      images: frames.map(frame => frame.split(",")[1]),
    };

    try {
      const response = await fetch('http://192.168.1.214:5001/upload', { // CHANGE THIS IP TO YOUR LOCAL HOST IP!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animationData),
      });

      if (!response.ok) {
        throw new Error('Error uploading animation data');
      }

      const data = await response.json();
      console.log('Animation data uploaded successfully', data);
    } catch (error) {
      setMessage(`Error uploading animation data: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    downloadJSON(animationData, `${animationName}.json`);
    setAnimationFrames(frames);
    setActivePage("AnimationDisplay");
  };

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

  const downloadJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sketchpad-container">
      <div className="message-container">
        {message && <div className="message">{message}</div>}
      </div>
      <div className="content-wrapper">
        <div className="left-section">
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
          </div>
          <div className="sketchpad-controls">
            <label>
              Pen: 
              <input
                type="color"
                name="penColor"
                value={penColor}
                onChange={handleColorChange}
              />
            </label>
            <label>
              Canvas: 
              <input
                type="color"
                name="backgroundColor"
                value={backgroundColor}
                onChange={handleColorChange}
              />
            </label>
            <input
              type="text"
              placeholder="Animation Name"
              name="animationName"
              value={animationName}
              onChange={handleInput}
              className="animation-name-input"
            />
            <input
              type="number"
              placeholder="FPS"
              name="fps"
              value={fps}
              onChange={handleInput}
              className="fps-input"
              min="1"
            />
          </div>
          <div className="action-buttons">
            <button className="button" onClick={() => setIsErasing(!isErasing)}>
              {isErasing ? "Switch to Pen" : "Switch to Eraser"}
            </button>
            <button className="button" onClick={saveFrame}>Save Frame</button>
            <button className="button" onClick={finishAndSend}>Finish and Send</button>
          </div>
          <div className="action-buttons">
            <button className="danger button" onClick={clearSketchpad}>Clear Sketchpad</button>
            <button className="danger button" onClick={newAnimationSequence}>Delete and Restart</button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width="600"
          height="600"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          className="sketchpad-canvas"
        ></canvas>
      </div>
    </div>
  );
};

export default Sketchpad;


