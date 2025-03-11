import React, { useState } from 'react';
import ModalRAdm from './ModalR_Adm';
import ModalRAlm from './ModalR_Alm';
import ModalAdmin from './ModalAdmin';
import ModalAlm from './ModalAlm';

const ButtonGroup = ({ isStorageSelected, onSave, reloadArticulos }) => {
  const [isModalEntradaOpen, setIsModalEntradaOpen] = useState(false);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);

  const handleOpenEntradaModal = () => {
    setIsModalEntradaOpen(true);
 
  };

  const handleCloseEntradaModal = () => setIsModalEntradaOpen(false);

  const handleOpenAddModal = () => setIsModalAddOpen(true);
  const handleCloseAddModal = () => setIsModalAddOpen(false);

  const refreshArticulos = () => {
    onSave();
    handleCloseAddModal();
  };
  

  return (
    <div>
      <div className="flex space-x-4">
        <button
          className="bg-white text-green-600 py-2 px-4 border-2 border-green-600 rounded hover:bg-[#00A305]"
          onClick={handleOpenAddModal}
        >
          <span className="text-green-600 hover:text-white py-2 px-1">Agregar Artículo</span>
          <i className="fas fa-plus ml-2 text-white bg-[#00A305] p-1 rounded-full"></i>
        </button>

        <button
          className="bg-white text-green-600 py-2 px-4 border-2 border-green-600 rounded hover:text-white hover:bg-[#00A305]"
          onClick={handleOpenEntradaModal}
        >
      
          {isStorageSelected ? 'Reporte' : 'Traslados'}
        </button>
      </div>

      {isStorageSelected ? (
        <>
          <ModalRAlm
            isOpen={isModalEntradaOpen}
            onClose={handleCloseEntradaModal}
            reloadArticulos={reloadArticulos}
          />
          <ModalAlm
            isOpen={isModalAddOpen}
            onClose={handleCloseAddModal}
            onSave={refreshArticulos}
          />
        </>
      ) : (
        <>
          <ModalRAdm isOpen={isModalEntradaOpen} onClose={handleCloseEntradaModal} />
          <ModalAdmin
            isOpen={isModalAddOpen}
            onClose={handleCloseAddModal}
            onSave={refreshArticulos}
          />
        </>
      )}
    </div>
  );
};

export default ButtonGroup;
