import React from "react";

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="bg-white p-6 rounded-lg w-full max-w-md md:w-2/3 lg:w-1/3 shadow-lg relative mx-4">
        {/* Mensaje */}
        <div className="text-center mt-4">
          <p className="text-lg md:text-xl text-gray-700">{message}</p>
        </div>

        {/* Botones */}
        <div className="flex flex-col md:flex-row justify-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={onConfirm}
            className="bg-[#00A305] text-white py-2 px-4 rounded hover:bg-green-600 text-sm md:text-base"
          >
            Aceptar
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 text-sm md:text-base"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
