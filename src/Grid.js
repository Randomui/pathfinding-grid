import React, { useState } from 'react';
import './Grid.css';

const Grid = () => {
  const gridSize = 20;
  const totalCells = gridSize * gridSize;
  
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [path, setPath] = useState([]);
  const [obstacles, setObstacles] = useState(new Set()); // State to track obstacles

  // Function to handle clicking on a grid cell
  const handleCellClick = (index) => {
    if (!selectedStart) {
      setSelectedStart(index);
    } else if (!selectedEnd && index !== selectedStart) {
      setSelectedEnd(index);
      sendCoordinatesToBackend(selectedStart, index);
    } else if (index !== selectedStart && index !== selectedEnd) {
      // Toggle obstacle on click
      const newObstacles = new Set(obstacles);
      if (newObstacles.has(index)) {
        newObstacles.delete(index);
      } else {
        newObstacles.add(index);
      }
      setObstacles(newObstacles);
    }
  };

  // Function to send start and end points to the backend
  const sendCoordinatesToBackend = async (startIndex, endIndex) => {
    const startX = startIndex % gridSize;
    const startY = Math.floor(startIndex / gridSize);
    const endX = endIndex % gridSize;
    const endY = Math.floor(endIndex / gridSize);

    try {
      const response = await fetch('http://localhost:5000/api/find-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          start: { x: startX, y: startY }, 
          end: { x: endX, y: endY },
          obstacles: Array.from(obstacles).map(index => ({
            x: index % gridSize,
            y: Math.floor(index / gridSize),
          })),
        }),
      });

      const data = await response.json();
      const pathCoordinates = data.path.map(coord => coord.y * gridSize + coord.x);
      setPath(pathCoordinates);
    } catch (error) {
      console.error('Error fetching path:', error);
    }
  };

  // Helper function to determine cell's class
  const getCellClass = (index) => {
    if (index === selectedStart) return 'cell start';
    if (index === selectedEnd) return 'cell end';
    if (obstacles.has(index)) return 'cell obstacle'; // Add obstacle class
    if (path.includes(index)) return 'cell path';
    return 'cell';
  };

  // Function to reset the grid
  const resetGrid = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setPath([]);
    setObstacles(new Set());
  };

  return (
    <div>
      <button onClick={resetGrid}>Reset Grid</button>
      <div className="grid">
        {Array.from({ length: totalCells }).map((_, index) => (
          <div
            key={index}
            className={getCellClass(index)}
            onClick={() => handleCellClick(index)}
          >
            {index}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
