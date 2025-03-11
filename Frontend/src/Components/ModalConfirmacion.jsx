import React from 'react';

const ModalConfirmacion = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-5/3  relative">
        {/* Mensaje */}
        <div className="text-center mt-4">
          <p className="text-xl text-gray-700">{message}</p>
        </div>
        
        {/* Icono de confirmación */}
        <div className="flex justify-center items-center mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
