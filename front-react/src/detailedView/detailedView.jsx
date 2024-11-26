import React, { useState, useEffect } from "react";
import rectanglesData from './dimensions.json';
import Rectangle from './rectangle';
import { calculateSVGSize } from "./utils";
import axios from 'axios';

async function fetchRoomsEntries(){
  try {
    const response = await axios.post('http://localhost:8000/get_ocupacion_piso',{
      edificio: "ML",
      piso: "5"
    });
    console.log(response.data);
    return response.data;
  }catch (error){
    console.error('Error fetching rooms entries:', error);
  }
}

async function updateOcupation(rectangles){
  const rooms = await fetchRoomsEntries();
  if (!rooms) return;
  
  for (const rango in rooms[Object.keys(rooms)[0]]) {
    for (const room in rooms) {
      let ocupation = rooms[room][rango];
      if (ocupation === undefined) ocupation = 0;
      console.log(room, ocupation);
      rectangles[room].ocupation = ocupation;
    }
    await sleep(1000);
  }
}



function DetailedView() {
  
  const [building, setBuilding] = useState("");
  const [rectangles, setRectangles] = useState([]);
  const [floor, setFloor] = useState("");
  const [hoveredRectangle, setHoveredRectangle] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const buildingFromUrl = queryParams.get("building");
    const floorFromUrl = queryParams.get("floor");
  
    if (buildingFromUrl && floorFromUrl) {
      setBuilding(buildingFromUrl);
      setFloor(floorFromUrl);
  
      const data = rectanglesData[buildingFromUrl]?.[floorFromUrl];
      if (data) {
        const rectanglesData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          text: key,
        }));
        setRectangles(rectanglesData);
      }
    }
  }, []);
  
  useEffect(() => {
    if (rectangles.length > 0) {
      updateOcupation(rectangles);
    }
  }, [rectangles]); // This effect runs when rectangles is updated
  

  const svgSize = calculateSVGSize(rectangles);

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      <h2>Detalles del edificio: {building} - {floor}</h2>
      <svg width={svgSize.width} height={svgSize.height}>
        <rect
          x={0}
          y={0}
          width={svgSize.width}
          height={svgSize.height}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        {rectangles.map(({ id, positionx, positiony, width, height, text, ocupation }) => (
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
