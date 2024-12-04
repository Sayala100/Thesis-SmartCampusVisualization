import React, { useState, useEffect } from "react";
import rectanglesData from './dimensions.json';
import Rectangle from './rectangle';
import { calculateSVGSize } from "./utils";
import axios from 'axios';
import detailbg from '../../assets/detailbg.png';
import ColorRange from "../colorLegend/colorRange";

const API_URL = window.location.hostname === 'smartcampus.notadev.lat' ? 'https://tesis.notadev.lat' : 'http://localhost:2604';

async function fetchRoomsEntries(edificio, piso) {
  try {
    console.log(edificio, piso);
    
    const response = await axios.post(`${API_URL}/get_ocupacion_piso`,{
      Edificio: edificio,
      Piso: piso
    });
    return response.data;
  }catch (error){
    console.error('Error fetching rooms entries:', error);
  }
}

async function fetchRooms() {
  try {
    const response = await axios.get(`${API_URL}/get_salones`);
    // Ensure the "salones" key is extracted correctly
    return response.data.salones || []; // Return an empty array if "salones" is undefined
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return []; // Fallback to an empty array to prevent crashes
  }
}

async function updateOcupation(rectangles, setTime, setDisplayTime, edificio, piso) {
  console.log(edificio, piso);
  const rooms = await fetchRoomsEntries(edificio, piso);
  if (!rooms) return;

  const regex = /(\d+)(?:\.(\d+))?-(\d+)(?:\.(\d+))?/;
  while(true){
  
  for (const rango in rooms[Object.keys(rooms)[0]]) {
    const match = rango.match(regex);
    
    let num1 = match[1];
    let decimal1 = match[2];
    let num2 = match[3];
    let decimal2 = match[4];
    
    let formattedNum1 = decimal1 === "0" ? `${num1}:00` : `${num1}:${decimal1 === "5" ? "30" : "00"}`;
    let formattedNum2 = decimal2 === "0" ? `${num2}:00` : `${num2}:${decimal2 === "5" ? "30" : "00"}`;
    
    setDisplayTime(`${formattedNum1} - ${formattedNum2}`);

    // Prepare occupation states
    const occupationStates = {};
    for (const room in rooms) {
      if (room in rectangles) {
        const endOcupation = rooms[room][rango];
        
        occupationStates[room] = {
          start: rectangles[room]["ocupation"]||0,  // Starting value
          end: endOcupation  // Increase to full occupation
        };
      }
    }

    // Smoothly transition through states
    for (let i = 0; i <= 100; i++) {
      // Calculate interpolation factor (0 to 1)
      const t = i / 100;

      // Update all rooms simultaneously
      for (const room in occupationStates) {
        // Linearly interpolate from start to end
        const interpolatedValue = Math.round(
          occupationStates[room].start + 
          (occupationStates[room].end - occupationStates[room].start) * t
        );
        
        rectangles[room]["ocupation"] = interpolatedValue;
      }

      // Update time display
      setTime(`${formattedNum1} - Transition (${Math.round(t * 100)}%)`);

      // Wait for a proportional time slice
      await new Promise(resolve => setTimeout(resolve, 0.5)); 
    }

    // Ensure final state is exactly the original occupation
    for (const room in occupationStates) {
      rectangles[room]["ocupation"] = occupationStates[room].end;
    }

    await sleep(2000);
    setTime(`${formattedNum1} - ${formattedNum2}`);
    setDisplayTime(formattedNum2);
  }
}
}

function exportToCSV(data, filename) {
  // Convert data array to a CSV string
  const csvContent = 'data:text/csv;charset=utf-8,' + data.join('\n');

  // Create a downloadable link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);

  // Append link to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
}

async function download_empty_rooms(rectangles) {
  let rooms = await fetchRooms();
  if (!rooms) return;

  // Extract and flatten all room names from the rectangles object
  const rectangleRooms = [];
  for (const buildingKey in rectangles) {
    const building = rectangles[buildingKey];
    for (const floorKey in building) {
      const floor = building[floorKey];
      for (const roomKey in floor) {
        rectangleRooms.push(roomKey); // Collect all room keys
      }
    }
  }

  // Find rooms in `rectangleRooms` that are not in the backend `rooms`
  const empty_rooms = rectangleRooms.filter(room => !rooms.includes(room));

  console.log('Empty Rooms:', empty_rooms);
  // Export to CSV
  exportToCSV(empty_rooms, 'empty_rooms.csv');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const canvasElement = document.getElementById('bg');
canvasElement.remove();

const DetailedView = () => {
  const [building, setBuilding] = useState("");
  const [rectangles, setRectangles] = useState({});
  const [allRectangles, setAllRectangles] = useState({});
  const [floor, setFloor] = useState("");
  const [hoveredRectangle, setHoveredRectangle] = useState(null); // Update to store more details
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const buildingFromUrl = queryParams.get("building");
    const floorFromUrl = queryParams.get("floor");

    setAllRectangles(rectanglesData);

    if (buildingFromUrl && floorFromUrl) {
      setBuilding(buildingFromUrl);
      setFloor(floorFromUrl);

      const data = rectanglesData[buildingFromUrl]?.[floorFromUrl];
      if (data) {
        const rectanglesObject = Object.keys(data).reduce((acc, key) => {
          // Keep only the ones that match the building and floor
          acc[key] = {
            ...data[key],
            text: key,
          };
          return acc;
        }, {});

        setRectangles(rectanglesObject);
      }
    }
  }, []);

  useEffect(() => {
    updateOcupation(rectangles, setTime, setDisplayTime, building, floor);
  }, [rectangles]);

  const svgSize = calculateSVGSize(rectangles);

  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
        backgroundImage: `url(${detailbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        margin: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
    <div
    style={{
      display: "flex", // Flexbox for horizontal layout
      alignItems: "center", // Vertically align items
      justifyContent: "space-between", // Space out elements
      backgroundColor: "#333",
      padding: "10px 20px",
    }}
  >
    <button
      style={{
        backgroundColor: "#333",
        color: "white",
        border: "none",
        fontSize: "30px",
        cursor: "pointer",
      }}
      onClick={() => (window.location.href = "/")}
    >
      Volver
    </button>
  
    <h2
      style={{
        color: "white",
        fontSize: "32px",
        margin: "0", // Remove default margin for better alignment
        flex: "1", // Allow the heading to grow and push itself to the center
        textAlign: "center", // Center the text within its space
      }}
    >
      Detalles del edificio: {building} - {floor}
    </h2>
  
    <button
      onClick={() => download_empty_rooms(allRectangles)} // Ensure function is called with parameters
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        border: "none",
        color: "white",
        borderRadius: "5px",}}> Descargar salones no utilizados</button>
  </div>

      <ColorRange />
      <h3 style={{color:'white', fontSize:'24px'}}>Franja horaria: {displayTime}</h3>
      <svg width={svgSize.width} height={svgSize.height}>
        <rect
          x={0}
          y={0}
          width={svgSize.width}
          height={svgSize.height}
          fill="black"
          stroke="black"
          strokeWidth="2"
          opacity={0.5}
          rx={50}
          ry={50}
        />
        {Object.values(rectangles).map(({ id, positionx, positiony, width, height, text, ocupation }) => (
          <Rectangle
            key={id}
            x={positionx + svgSize.xOffset}
            y={positiony + svgSize.yOffset}
            width={width}
            height={height}
            text={text}
            onHover={() => setHoveredRectangle({ text, positionx, positiony, width, ocupation })}
            onLeave={() => setHoveredRectangle(null)}
            ocupation={ocupation}
            />
          ))}
      </svg>
      {hoveredRectangle && (
        <div
          style={{
            position: "absolute",
            top: `${hoveredRectangle.positiony + svgSize.yOffset +100 }px`, // Slightly above the rectangle
            left: `${hoveredRectangle.positionx+svgSize.xOffset+690}px`, // To the right of the rectangle
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transform: "translate(-50%, -100%)", // Adjust to center the tooltip horizontally and vertically
            whiteSpace: "nowrap", // Prevent text wrapping
          }}
        >
          <p style={{ margin: 0 }}>Seleccionado: <b>{hoveredRectangle.text}</b>
          <br></br>
          Ocupación: {hoveredRectangle.ocupation}%
          </p>
        </div>
      )}
    </div>
  );
};

export default DetailedView;
