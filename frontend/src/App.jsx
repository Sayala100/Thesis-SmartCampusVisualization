import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/Navbar';
import ColorRange from './components/colorLegend/colorRange';

const Edificio = lazy(() => import('./components/edificio'));
const DetailedView = lazy(() => import('./components/detailedView/detailedView'));

function ContenidoApp() {
  return (
    <div className="App">
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/detail" element={<DetailedView />} />
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

  return (
    <header className="App-header">
      {/* Move the dropdowns and button to the Navbar */}
      <Navbar
        cantidadPisos={cantidadPisos}
        edificioSeleccionado={edificioSeleccionado}
        setEdificioSeleccionado={setEdificioSeleccionado}
        pisos={pisos}
        setPisos={setPisos}
        pisoSeleccionado={pisoSeleccionado}
        setPisoSeleccionado={setPisoSeleccionado}
      />

      <ColorRange />
      
      <Edificio />
    </header>
  );
}

export default App;
