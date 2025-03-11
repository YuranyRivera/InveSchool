import React from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import DateInput from '../../Components/DateInput';
import DashboardLayout from '../../Layouts/DashboardLayout';
import TablaArt from '../../Components/TablaArt';
import '@dotlottie/player-component';
import ModalConfi from '../../Components/ModalConf';
import { useHistorialBajas } from '../../hooks/useHistorialBajas';

const HistorialBajas = () => {
  // Define las funciones createImageButton y createPDFButton antes de usarlas
  const createImageButton = (imageUrl, onClick) => {
    if (imageUrl) {
      return (
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 text-[#00A305] hover:text-[#00A305]"
        >
          <ImageIcon size={20} />
          Ver imagen
        </button>
      );
    }
    return <span className="text-gray-400">Sin imagen</span>;
  };

  const createPDFButton = (rowData) => (
    <button
      onClick={() => handleRowPDF(rowData)}
      className="bg-[#00A305] text-white py-2 px-4 rounded hover:bg-[#00A305]"
    >
      PDF
    </button>
  );

  // Ahora puedes usar el hook useHistorialBajas
  const {
    isLoading,
    selectedOption,
    headers,
    filteredRows,
    searchTerm,
    fromDate,
    toDate,
    selectedImage,
    showDeleteConfirmation,
    setSearchTerm,
    setFromDate,
    setToDate,
    setSelectedImage,
    handleOptionChange,
    handleDeleteClick,
    handleConfirmDelete,
    setShowDeleteConfirmation,
    exportToPDF,
    exportToExcel,
    handleRowPDF
  } = useHistorialBajas(createImageButton, createPDFButton);

  const ImageModal = ({ url, onClose }) => {
    if (!url) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white p-10 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={url} alt="Imagen de baja" className="max-w-full h-auto" />
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <dotlottie-player
            src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
            background="transparent"
            speed="1"
            style={{ width: '300px', height: '300px' }}
            loop
            autoplay
          />
        </div>
      ) : (
        <div className="mb-6 m-5">
          <h1 className="text-3xl font-bold text-center text-black mb-10">
            Historial de Artículos Dados de Baja
          </h1>
          
          <div className="flex flex-wrap gap-2 md:gap-4 mt-4 mb-6 ">
            {['general', 'traslados', 'bajas', 'bajas2', 'reporte'].map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="navigation"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                  className="appearance-none h-5 w-5 border border-green-600 rounded-full 
                    checked:bg-[#00A305] checked:border-[#00A305] 
                    focus:outline-none transition duration-200 mr-2 cursor-pointer"
                />
                <span className="text-gray-700">
                  {option === 'general' && 'General'}
                  {option === 'traslados' && 'Traslados'}
                  {option === 'bajas' && 'Historial de bajas-Administración'}
                  {option === 'bajas2' && 'Historial de bajas-Almacenamiento'}
                  {option === 'reporte' && 'Reporte'}
                </span>
              </label>
            ))}
          </div>


          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por artículo, motivo, usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Botones de exportación */}
              <div className="flex gap-1">
                <button
                  onClick={exportToPDF}
                  className="bg-white text-green-600 py-2 px-4 border-2 border-green-600 rounded hover:text-white hover:bg-[#00A305] whitespace-nowrap"
                >
                  <i className="fas fa-file-pdf mr-2"></i> PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-[#00A305] text-white py-2 px-4 rounded hover:bg-green-700 whitespace-nowrap"
                >
                  <i className="fas fa-file-excel mr-2"></i> Excel
                </button>
              </div>
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Desde</label>
                <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hasta</label>
                <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Table */}
          <TablaArt
            headers={headers}
            rows={filteredRows}
            showActions={true}
            onDelete={handleDeleteClick}
          />

          {/* Modals */}
          <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />
          <ModalConfi
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
            message="¿Estás seguro de eliminar este artículo?"
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default HistorialBajas;