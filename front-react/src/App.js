import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import DetailedView from './detailedView/detailedView';

const Edificio = lazy(() => import('./edificio'));

function AppContent() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/hello" element={<DetailedView />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function Main() {
  const cantidad_pisos = {
    ML: ["1", "2", "5", "6"],
    LL: ["1", "2", "3"],
    SD: ["2", "3", "4", "7", "8"],
    RGD: ["0000", "000", "1", "2", "3"],
  };

  const [selectedBuilding, setSelectedBuilding] = useState("SD");
  const [floors, setFloors] = useState(cantidad_pisos["SD"]);
  const [selectedFloor, setSelectedFloor] = useState(cantidad_pisos["SD"][0]);

  const handleBuildingChange = (e) => {
    const building = e.target.value;
    setSelectedBuilding(building);
    setFloors(cantidad_pisos[building]);
    setSelectedFloor(cantidad_pisos[building][0]);
  };

  const handleFloorChange = (e) => {
    setSelectedFloor(e.target.value);
  };

  return (
    <header className="App-header">
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'absolute', 
          top: '20px', 
          width: '100%',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            style={{
              padding: '10px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            value={selectedBuilding}
            onChange={handleBuildingChange}
          >
            {Object.keys(cantidad_pisos).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
  
          <select
            style={{
              padding: '10px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            value={selectedFloor}
            onChange={handleFloorChange}
          >
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>
  
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
          onClick={() => {
            window.location.href = `/hello?building=${selectedBuilding}&floor=${selectedFloor}`;
          }}
        >
          Go to detailed view
        </button>
      </div>
      <Edificio />
    </header>
  );
}



export default App;
