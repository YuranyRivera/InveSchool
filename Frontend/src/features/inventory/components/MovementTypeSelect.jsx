import { useState } from 'react';

// Componente para el menú desplegable
const MovementTypeSelect = ({ onChange, currentStatus }) => {
  const [selectedValue, setSelectedValue] = useState(currentStatus || 1); // Estado local para la opción seleccionada

  const handleChange = (event) => {
    const selected = Number(event.target.value);  // Convierte el valor seleccionado a número
    setSelectedValue(selected);  // Actualiza el estado local
    onChange(selected);  // Llama la función onChange pasada desde el componente padre para actualizar el estado en la base de datos
  };

  return (
    <div className="w-56">
      <label htmlFor="estado" className="label">Entrada y salida</label>
      <select
        id="estado"
        name="estado"
        className="input"
        value={selectedValue}
        onChange={handleChange}
      >
        <option value={2}>Entrada</option>
        <option value={1}>Salida</option>
      </select>
    </div>
  );
};

export default MovementTypeSelect;
