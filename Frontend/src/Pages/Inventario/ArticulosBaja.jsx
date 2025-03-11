import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import DateInput from '../../Components/DateInput';
import DashboardLayout from '../../Layouts/DashboardLayout';
import TablaArt from '../../Components/TablaArt';
import ModalConfirmacion from '../../Components/ModalConf';
import Select from 'react-select';
import '@dotlottie/player-component';
import useArticulosBaja from '../../hooks/useArticulosBaja';

const Example = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('bajas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articuloToDelete, setArticuloToDelete] = useState(null);

  const {
    isLoading,
    rows,
    searchTerm,
    setSearchTerm,
    selectedLocationInitial,
    setSelectedLocationInitial,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    ubicaciones,
    handleDelete,
    exportToPDF,
    exportToExcel,
  } = useArticulosBaja();

  const headers = ['ID', 'Código', 'Fecha', 'Descripción', 'Proveedor', 'Ubicación', 'Observación'];

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    switch (value) {
      case 'general':
        navigate('/registro');
        break;
      case 'traslados':
        navigate('/moduloadmin');
        break;
      case 'bajas':
        navigate('/articulosbaja');
        break;
      case 'bajas2':
        navigate('/articulosbaja2');
        break;
        case 'reporte':
          navigate('/reporte');
          break;
      default:
        break;
    }
  };

  const handleDeleteClick = (row) => {
    setArticuloToDelete(row);
    setIsModalOpen(true);
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
        <>
          <ModalConfirmacion
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (articuloToDelete) {
                handleDelete(articuloToDelete[0]);
              }
              setIsModalOpen(false);
            }}
            message="¿Está seguro de que desea dar de baja este artículo?"
          />
          <div className="mb-6 m-5">
            <h1 className="text-3xl font-bold text-center text-black mb-10">Artículos Dados de Baja</h1>
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
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por descripción, proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <Select
                    options={ubicaciones}
                    value={selectedLocationInitial}
                    onChange={setSelectedLocationInitial}
                    isClearable
                    placeholder="Seleccionar ubicación..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desde</label>
                  <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hasta</label>
                  <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
              <TablaArt
                title="Artículos Administrativos"
                headers={headers}
                rows={rows}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Example;