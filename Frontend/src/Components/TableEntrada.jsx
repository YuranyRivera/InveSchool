import React, { useState } from 'react';
import ModalInforme from './ModalInforme';
import ModalConfi from './ModalConf';

const TableEntrada = ({ headers, rows, setRows, reloadArticulos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const handleOpenModal = async (row) => {
    const movimientoId = row[0];
    setLoading(true);
    try {
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/movimiento/${movimientoId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles');
      const data = await response.json();
      setModalData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar los detalles:', error);
      alert('Hubo un error al obtener los detalles del movimiento.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData([]);
  };

  const handleDeleteConfirm = (id) => {
    setDeleteRowId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleteConfirmOpen(false);
    setLoading(true);
    try {
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/eliminar-movimiento/${deleteRowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el registro');
      
      setRows((prevRows) => prevRows.filter((row) => row[0] !== deleteRowId));
      setDeleteRowId(null);
      
      // Call reloadArticulos after successful deletion
      reloadArticulos();
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      alert('Hubo un error al eliminar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-4">
      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-[#00A305] text-white">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left">{header}</th>
              ))}
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-t ${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-gray-300 transition-colors`}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 truncate max-w-xs">{cell}</td>
                ))}
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(row)}
                      disabled={loading}
                      className="bg-[#00A305] text-white py-1 px-3 rounded flex items-center hover:bg-green-700 transition-colors"
                    >
                      <i className="fas fa-file-alt mr-2"></i> 
                      {loading ? 'Cargando...' : 'Informe'}
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(row[0])}
                      disabled={loading}
                      className="bg-red-500 text-white py-1 px-3 rounded flex items-center hover:bg-red-700 transition-colors"
                    >
                      <i className="fas fa-trash mr-2"></i> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista en tarjetas para pantallas pequeñas */}
      <div className="block md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="border rounded-lg shadow-md p-4 bg-white"
          >
            {headers.map((header, cellIndex) => (
              <div key={cellIndex} className="py-2 border-b last:border-b-0">
                <div className="text-sm font-medium text-gray-600">{header}</div>
                <div className="mt-1 font-medium break-words">{row[cellIndex]}</div>
              </div>
            ))}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleOpenModal(row)}
                disabled={loading}
                className="bg-[#00A305] text-white py-2 px-3 rounded flex-1 hover:bg-green-700 transition-colors flex justify-center items-center"
              >
                <i className="fas fa-file-alt mr-2"></i> 
                {loading ? 'Cargando...' : 'Informe'}
              </button>
              <button
                onClick={() => handleDeleteConfirm(row[0])}
                disabled={loading}
                className="bg-red-500 text-white py-2 px-3 rounded flex-1 hover:bg-red-700 transition-colors flex justify-center items-center"
              >
                <i className="fas fa-trash mr-2"></i> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {isModalOpen && (
        <ModalInforme isOpen={isModalOpen} onClose={handleCloseModal} data={modalData} />
      )}
      <ModalConfi
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar este registro?"
      />
    </div>
  );
};

export default TableEntrada;