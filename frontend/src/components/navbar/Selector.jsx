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

export default Selector;