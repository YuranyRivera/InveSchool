import React, { useState } from 'react';

// Componente para el menú desplegable
const EstadoSelect = ({ onChange, currentStatus }) => {
  const [selectedValue, setSelectedValue] = useState(currentStatus || 1); // Estado local para la opción seleccionada

  const handleChange = (event) => {
    const selected = Number(event.target.value);  // Convierte el valor seleccionado a número
    setSelectedValue(selected);  // Actualiza el estado local
    onChange(selected);  // Llama la función onChange pasada desde el componente padre para actualizar el estado en la base de datos
  };

  return (
    <div className="w-56">
      <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Entrada y Salida</label>
      <select
        id="estado"
        name="estado"
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        value={selectedValue}
        onChange={handleChange}
      >
        <option value={2}>Entrada</option>
        <option value={1}>Salida</option>
      </select>
    </div>
  );
};

export default EstadoSelect;
