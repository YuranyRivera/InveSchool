import { useState, useEffect } from 'react';
import { notify } from '@/lib/notify';

const DisposalObservationModal = ({ isOpen, onClose, onSave }) => {
  const [observacion, setObservacion] = useState('');

  // Reset observation when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setObservacion('');
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setObservacion(e.target.value);
  };

  const handleSave = () => {
    if (observacion.trim() === '') {
      notify('Por favor, ingresa una observación.', 'info');
      return;
    }

    // Llamada a la función onSave para guardar la observación
    onSave(observacion);
    // No need to call onClose here since onSave will trigger a re-render
  };

  const handleCancel = () => {
    // Clear the observation and close the modal
    setObservacion('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative border border-line shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-fg">Agregar observación</h2>
    
        {/* Campo de texto para la observación */}
        <textarea
          className="input h-32 resize-none py-3"
          placeholder="Escribe la observación..."
          value={observacion}
          onChange={handleInputChange}
        />
    
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {/* Botón para guardar la observación */}
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={handleSave}
          >
            Guardar
          </button>
    
          {/* Botón para cerrar el modal */}
          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisposalObservationModal;