import React, { useState } from 'react';

const ModalObservacion = ({ isOpen, onClose, onSave }) => {
  const [observacion, setObservacion] = useState('');

  const handleInputChange = (e) => {
    setObservacion(e.target.value);
  };

  const handleSave = () => {
    if (observacion.trim() === '') {
      alert('Por favor, ingresa una observación.');
      return;
    }

    // Llamada a la función onSave para guardar la observación
    onSave(observacion);
    onClose(); // Cierra el modal después de guardar
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative">
      <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-700 text-center mb-4">
        Ingresa una Observación
      </h2>
  
      {/* Campo de texto para la observación */}
      <textarea
        className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none text-sm sm:text-base"
        placeholder="Escribe la observación..."
        value={observacion}
        onChange={handleInputChange}
      />
  
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        {/* Botón para guardar la observación */}
        <button
          className="w-full sm:w-auto bg-white hover:bg-[#00A305] text-green-600 rounded-lg border-2 border-green-600 px-4 py-2 hover:text-white transition duration-300 text-sm sm:text-base"
          onClick={handleSave}
        >
          Guardar
        </button>
  
        {/* Botón para cerrar el modal */}
        <button
          className="w-full sm:w-auto bg-gray-300 text-black px-4 py-2 rounded-lg text-sm sm:text-base"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default ModalObservacion;
