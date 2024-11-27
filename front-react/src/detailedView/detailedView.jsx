import React, { useState, useEffect } from "react";
import rectanglesData from './dimensions.json';
import Rectangle from './rectangle';
import { calculateSVGSize } from "./utils";
import axios from 'axios';
import detailbg from '../assets/detailbg.png';

async function fetchRoomsEntries(){
  try {
    const response = await axios.post('https://tesis.notadev.lat/get_ocupacion_piso',{
      Edificio: "ML",
      Piso: "5"
    });
    return response.data;
  }catch (error){
    console.error('Error fetching rooms entries:', error);
  }
}

async function updateOcupation(rectangles, setTime, setDisplayTime) {
  const rooms = await fetchRoomsEntries();
  if (!rooms) return;

  const regex = /(\d+)(?:\.(\d+))?-(\d+)(?:\.(\d+))?/;
  
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
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const clockElement = document.getElementById('clock');
clockElement.remove();

const canvasElement = document.getElementById('bg');
canvasElement.remove();

function DetailedView() {
  
  const [building, setBuilding] = useState("");
  const [rectangles, setRectangles] = useState({});
  const [floor, setFloor] = useState("");
  const [hoveredRectangle, setHoveredRectangle] = useState("");
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const buildingFromUrl = queryParams.get("building");
    const floorFromUrl = queryParams.get("floor");
  
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
        // updateOcupation(rectangles);
      }
    }
  }, []);  

  useEffect(() => {
    updateOcupation(rectangles, setTime, setDisplayTime);
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
        margin: "0", // Add this
        padding: "0", // Add this
        overflow: "hidden", // Prevent scrolling from unnecessary whitespace
      }}>
      <h2>Detalles del edificio: {building} - {floor}</h2>
      <h3>Franja horaria: {displayTime}</h3>
      <svg width={svgSize.width} height={svgSize.height}>
        <rect
          x={0}
          y={0}
          width={svgSize.width}
          height={svgSize.height}
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        {Object.values(rectangles).map(({ id, positionx, positiony, width, height, text, ocupation }) => (
          <Rectangle
            key={id}
            x={positionx + svgSize.xOffset}
            y={positiony + svgSize.yOffset}
            width={width}
            height={height}
            text={text}
            onHover={(name) => setHoveredRectangle(name)}
            onLeave={() => setHoveredRectangle("")}
            ocupation={ocupation}
          />
        ))}
      </svg>
      {hoveredRectangle && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ margin: 0 }}>Hovered: <b>{hoveredRectangle}</b></p>
        </div>
      )}
    </div>
  );
}

export default DetailedView;
