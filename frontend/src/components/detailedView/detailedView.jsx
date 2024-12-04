import React, { useState, useEffect, useRef } from "react";
import rectanglesData from './dimensions.json';
import Rectangle from './rectangle';
import { calculateSVGSize } from "./utils";
import axios from 'axios';
import detailbg from '../../assets/detailbg.png';
import ColorRange from "../colorLegend/colorRange";

const API_URL = window.location.hostname === 'smartcampus.notadev.lat' ? 'https://tesis.notadev.lat' : 'http://localhost:2604';
const canvasElement = document.getElementById('bg');
canvasElement.remove();

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

const DetailedView = () => {
  const [building, setBuilding] = useState("");
  const [rectangles, setRectangles] = useState({});
  const [allRectangles, setAllRectangles] = useState({});
  const [floor, setFloor] = useState("");
  const [hoveredRectangle, setHoveredRectangle] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [displayTime, setDisplayTime] = useState('');
  const [rooms, setRooms] = useState(null);
  const [selectedRangoIndex, setSelectedRangoIndex] = useState(0);

  // Refs to control loop and async operations
  const shouldContinueLoopRef = useRef(true);
  const currentOperationRef = useRef(null);

  const stopCurrentOperation = () => {
    shouldContinueLoopRef.current = false;
    if (currentOperationRef.current) {
      clearTimeout(currentOperationRef.current);
      currentOperationRef.current = null;
    }
  };

  async function updateOcupation(rectangles, setTime, setDisplayTime, edificio, piso) {
    // Reset continue flag
    shouldContinueLoopRef.current = true;

    if (!rooms) return;

    const regex = /(\d+)(?:\.(\d+))?-(\d+)(?:\.(\d+))?/;
    const rangosArray = Object.keys(rooms[Object.keys(rooms)[0]]);

    while (shouldContinueLoopRef.current) {
      for (const rango of rangosArray) {
        // Stop if slider interaction occurred
        if (!shouldContinueLoopRef.current) break;

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
              start: rectangles[room]["ocupation"]||0,
              end: endOcupation
            };
          }
        }

        // Smoothly transition through states
        for (let i = 0; i <= 100; i++) {
          // Stop if slider interaction occurred
          if (!shouldContinueLoopRef.current) break;

          // Calculate interpolation factor (0 to 1)
          const t = i / 100;

          // Update all rooms simultaneously
          for (const room in occupationStates) {
            const interpolatedValue = Math.round(
              occupationStates[room].start + 
              (occupationStates[room].end - occupationStates[room].start) * t
            );
            
            rectangles[room]["ocupation"] = interpolatedValue;
          }

          // Update time display
          setTime(`${formattedNum1} - Transition (${Math.round(t * 100)}%)`);

          // Wait for a proportional time slice
          await new Promise(resolve => {
            currentOperationRef.current = setTimeout(resolve, 0.5);
          });
        }

        // Ensure final state is exactly the original occupation
        for (const room in occupationStates) {
          rectangles[room]["ocupation"] = occupationStates[room].end;
        }

        setTime(`${formattedNum1} - ${formattedNum2}`);

        // Add a pause between rangos
        await new Promise(resolve => {
          currentOperationRef.current = setTimeout(resolve, 2000);
        });
      }
    }
  }

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
          acc[key] = {
            ...data[key],
            text: key,
          };
          return acc;
        }, {});

        setRectangles(rectanglesObject);

        async function fetchRooms() {
          const fetchedRooms = await fetchRoomsEntries(buildingFromUrl, floorFromUrl);
          setRooms(fetchedRooms);
        }
        fetchRooms();
      }
    }
  }, []);

  useEffect(() => {
    if (rooms) {
      updateOcupation(rectangles, setTime, setDisplayTime, building, floor);
    }
  }, [rooms]);

  const svgSize = calculateSVGSize(rectangles);

  // Create rangos array for the slider
  const rangosArray = rooms 
    ? Object.keys(rooms[Object.keys(rooms)[0]])
    : [];

  // Format rango for display
  const formatRango = (rango) => {
    const regex = /(\d+)(?:\.(\d+))?-(\d+)(?:\.(\d+))?/;
    const match = rango.match(regex);
    
    let num1 = match[1];
    let decimal1 = match[2];
    let num2 = match[3];
    let decimal2 = match[4];
    
    let formattedNum1 = decimal1 === "0" ? `${num1}:00` : `${num1}:${decimal1 === "5" ? "30" : "00"}`;
    let formattedNum2 = decimal2 === "0" ? `${num2}:00` : `${num2}:${decimal2 === "5" ? "30" : "00"}`;
    
    return `${formattedNum1} - ${formattedNum2}`;
  };

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
      
      {/* Rango Slider */}
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        <label 
          htmlFor="rango-slider" 
          style={{color: 'white', marginRight: '10px'}}
        >
          Seleccionar Franja Horaria:
        </label>
        <input 
          id="rango-slider"
          type="range" 
          min="0" 
          max={rangosArray.length - 1} 
          value={selectedRangoIndex}
          onChange={(e) => {
            // Stop the current loop
            stopCurrentOperation();
            
            // Set the new rango index
            const newIndex = Number(e.target.value);
            setSelectedRangoIndex(newIndex);

            // Update occupation for the selected rango
            if (rooms) {
              const rangosArray = Object.keys(rooms[Object.keys(rooms)[0]]);
              const rango = rangosArray[newIndex];
              console.log("Selected rango:", rango);
              // Update rectangles with the selected rango's occupation
              const updatedRectangles = {...rectangles};
              for (const room in rooms) {
                if (room in updatedRectangles) {
                  updatedRectangles[room]["ocupation"] = rooms[room][rango];
                }
              }
              
              // Update rectangles state to trigger re-render
              setRectangles(updatedRectangles);
              setDisplayTime(formatRango(rango));
            }
          }}
          style={{width: '300px'}}
        />

      </div>

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
