import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import DetailedView from './detailedView/detailedView';

const Edificio = lazy(() => import('./edificio'));

function ContenidoApp() {
  return (
    <div className="App">
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/hello" element={<DetailedView />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ContenidoApp />
    </Router>
  );
}

function Selector({ opciones, valorSeleccionado, onChange }) {
  return (
    <select
      style={{
        padding: '10px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
      value={valorSeleccionado}
      onChange={onChange}
    >
      {opciones.map((opcion) => (
        <option key={opcion} value={opcion}>
          {opcion}
        </option>
      ))}
    </select>
  );
}

function Principal() {
  const cantidadPisos = {
    ML: ["1", "2", "5", "6"],
    LL: ["1", "2", "3"],
    SD: ["2", "3", "4", "7", "8"],
    RGD: ["0000", "000", "1", "2", "3"],
  };

  const [edificioSeleccionado, setEdificioSeleccionado] = useState("SD");
  const [pisos, setPisos] = useState(cantidadPisos["SD"]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(cantidadPisos["SD"][0]);

  const cambiarEdificio = (e) => {
    const edificio = e.target.value;
    setEdificioSeleccionado(edificio);
    setPisos(cantidadPisos[edificio]);
    setPisoSeleccionado(cantidadPisos[edificio][0]);
  };

  const cambiarPiso = (e) => {
    setPisoSeleccionado(e.target.value);
  };

  const irADetalle = () => {
    window.location.href = `/hello?building=${edificioSeleccionado}&floor=${pisoSeleccionado}`;
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
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Selector
            opciones={Object.keys(cantidadPisos)}
            valorSeleccionado={edificioSeleccionado}
            onChange={cambiarEdificio}
          />
          <Selector
            opciones={pisos}
            valorSeleccionado={pisoSeleccionado}
            onChange={cambiarPiso}
          />
        </div>
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
          onClick={irADetalle}
        >
          Ir a vista detallada
        </button>
      </div>
      <Edificio />
    </header>
  );
}

export default App;
