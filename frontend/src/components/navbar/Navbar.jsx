import  React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Selector from './Selector';

function Navbar({ cantidadPisos, edificioSeleccionado, setEdificioSeleccionado, pisos, pisoSeleccionado, setPisoSeleccionado, setPisos }) {
  useEffect(() => {
    // Notifica cuando el elemento clockk esté listo
    const event = new Event('clockkReady');
    window.dispatchEvent(event);
  }, []);

  const cambiarEdificio = (e) => {
    const edificio = e.target.value;
    setEdificioSeleccionado(edificio);
    setPisos(cantidadPisos[edificio]);
    setPisoSeleccionado(cantidadPisos[edificio][0]); // Reset piso to first option of new building
  };

  const cambiarPiso = (e) => {
    setPisoSeleccionado(e.target.value);
  };

  const irADetalle = () => {
    window.location.href = `/detail?building=${edificioSeleccionado}&floor=${pisoSeleccionado}`;
  };

  return (
    <nav style={navbarStyles}>
      <div style={navContentStyles}>
        <h1 id="clockk" style={clockStyles}>5:00 AM</h1>
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
        <button
          style={buttonStyles}
          onClick={irADetalle}
        >
          Ir a vista detallada
        </button>
      </div>
    </nav>
  );
}

const navbarStyles = {
  backgroundColor: '#333',
  padding: '10px 20px',
  width: '100%', // Make the navbar full width
  display: 'flex',
  justifyContent: 'center', // Centers the whole navbar content horizontally
  alignItems: 'center', // Centers vertically in the navbar
  color: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxSizing: 'border-box', // Ensures padding doesn't affect width
};

const navContentStyles = {
  display: 'flex',
  gap: '20px', // Increase gap between elements
  alignItems: 'center',
  justifyContent: 'center', // Centers all the elements horizontally
  width: '100%',
};

const clockStyles = {
  fontSize: '24px',
  margin: 0, // Optional: Remove default margin of h1 element
};

const buttonStyles = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  borderRadius: '5px',
};

export default Navbar;
