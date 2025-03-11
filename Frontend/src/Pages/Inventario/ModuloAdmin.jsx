import React, { useState, useEffect } from 'react';
import AuxMaintenanceTable from '../../Components/TablaArt';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { Search } from 'lucide-react';
import Select from 'react-select';
import CategorySelect from '../../Components/CategorySelect';
import DateInput from '../../Components/DateInput';
import ButtonGroup from '../../Components/PDFadmin';
import ExcelExportButton from '../../Components/Exceladmin';
import { useNavigate } from 'react-router-dom';
import '@dotlottie/player-component';

import ModalConfirmacion from '../../Components/ModalConf'; 
const Moduloadmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const headers = ['ID','Fecha', 'Ubicación Inicial', 'Producto',  'Código', 'Ubicación Final', 'Responsable'];
  const [selectedOption, setSelectedOption] = useState('traslados');
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationInitial, setSelectedLocationInitial] = useState('');
  const [selectedLocationFinal, setSelectedLocationFinal] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isModalConfirmacionOpen, setIsModalConfirmacionOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const ubicaciones = [
    { value: 'Recepción', label: 'Recepción' },
    { value: 'Tesorería', label: 'Tesorería' },
    { value: 'Coordinación convivencia', label: 'Coordinación convivencia' },
    { value: 'Rectoría', label: 'Rectoría' },
    { value: 'Secretaría académica', label: 'Secretaría académica' },
    { value: 'Coordinación académica', label: 'Coordinación académica' },
    { value: 'Sala de profesores', label: 'Sala de profesores' },
    { value: 'Aux contable y financiera', label: 'Aux contable y financiera' },
    { value: 'Aux administrativa y contable', label: 'Aux administrativa y contable' },
    { value: 'Contadora', label: 'Contadora' },
    { value: 'Cocina', label: 'Cocina' },
    { value: 'Almacén', label: 'Almacén' },
    { value: 'Espacio de servicios generales', label: 'Espacio de servicios generales' },
    { value: 'Sala audiovisuales', label: 'Sala audiovisuales' },
    { value: 'Sala lúdica', label: 'Sala lúdica' },
    { value: 'Capilla', label: 'Capilla' },
    { value: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
    { value: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
    { value: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
    { value: '107 - Ciudadanos-Comunicativos', label: '107 - Ciudadanos-Comunicativos' },
    { value: '108 - Curiosos-Pilosos/Pilosos', label: '108 - Curiosos-Pilosos/Pilosos' },
    { value: '109 - Ciudadanos/Pensamiento Filosófico', label: '109 - Ciudadanos/Pensamiento Filosófico' },
    { value: '201 - Comunicativos', label: '201 - Comunicativos' },
    { value: '202 - Comunicativos', label: '202 - Comunicativos' },
    { value: '203 - Fraternos y Espirituales', label: '203 - Fraternos y Espirituales' },
    { value: '204 - Pensamiento Matemático', label: '204 - Pensamiento Matemático' },
    { value: '205 - Ciudadanos', label: '205 - Ciudadanos' },
    { value: '206 - Activos', label: '206 - Activos' },
    { value: '206 - Pensamiento Matemático', label: '206 - Pensamiento Matemático' },
    { value: '207 - Indagación Biológica/Indagación Química', label: '207 - Indagación Biológica/Indagación Química' },
    { value: '211 - Indagación Biológica/Indagación Química', label: '211 - Indagación Biológica/Indagación Química' },
    { value: '212 - Indagación Biológica/Indagación Química', label: '212 - Indagación Biológica/Indagación Química' },
    { value: '301 - Innovadores', label: '301 - Innovadores' },
    { value: '302 - Fraternos-Espirituales/Ciudadanos', label: '302 - Fraternos-Espirituales/Ciudadanos' },
    { value: '303 - Ciudadanos/Comunicativos', label: '303 - Ciudadanos/Comunicativos' },
    { value: '304 - Comunicativos', label: '304 - Comunicativos' },
    { value: '305 - Curiosos', label: '305 - Curiosos' },
    { value: '306 - Pilosos/Curiosos', label: '306 - Pilosos/Curiosos' },
    { value: '307 - Wac', label: '307 - Wac' },
    { value: '308 - Comunicativos/Semillero de Lectura', label: '308 - Comunicativos/Semillero de Lectura' },
    { value: '311 - Wac', label: '311 - Wac' },
    { value: '312 - Indagación Física', label: '312 - Indagación Física' },
    { value: '313 - Pensamiento Matemático/Indagación Física', label: '313 - Pensamiento Matemático/Indagación Física' },
    { value: '314 - Pensamiento Matemático/Indagación Física', label: '314 - Pensamiento Matemático/Indagación Física' },
    { value: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico', label: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico' },
    { value: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico', label: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico' },
    { value: 'Sala 3 - 210 - Tecnología/Diseño Gráfico', label: 'Sala 3 - 210 - Tecnología/Diseño Gráfico' },
    { value: 'Lab. Wac 309 - Wac', label: 'Lab. Wac 309 - Wac' }
  ];


  useEffect(() => {
    const fetchTraslados = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://inventarioschool-v1.onrender.com/api/traslados');
        const data = await response.json();

        const formattedRows = data.map((traslado) => {
          return {
            id: traslado.id,
          
            fecha: formatDate(traslado.fecha),
            ubicacion_inicial: traslado.ubicacion_inicial,
            producto: traslado.nombre_articulo,
            codigo: traslado.codigo_articulo, // Agregamos el código
            ubicacion_final: traslado.ubicacion_final,
            responsable: traslado.responsable,
          };
        });
  
        setRows(formattedRows);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al obtener los traslados', error);
      }
    };

    fetchTraslados();
  }, []);

  const handleSave = async () => {
    try {
      const formattedDate = formatDate(editedRowData.fecha);
      const formattedData = { ...editedRowData, fecha: formattedDate };

      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/traslados/${formattedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Error al editar el traslado');
      }

      const updatedTraslado = await response.json();
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === updatedTraslado.id ? updatedTraslado : row))
      );
    } catch (error) {
      console.error('Error al editar:', error);
    }
  };
  const handleDeleteConfirmation = (row) => {
    setRowToDelete(row);
    setIsModalConfirmacionOpen(true);
  };
  
  const handleDelete = async () => {
    if (!rowToDelete) return;
  
    setIsLoading(true); // Mostrar el loader
    const id = rowToDelete.id;
  
    try {
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/traslados/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el traslado');
      }
  
      const result = await response.json();
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      setIsModalConfirmacionOpen(false);
  
      // Retrasar la ocultación del loader por 2 segundos
      setTimeout(() => {
        setIsLoading(false); // Ocultar el loader después de 2 segundos
      }, 2000); // 2000 ms
  
    } catch (error) {
      console.error('Error al eliminar:', error);
      setIsModalConfirmacionOpen(false);
  
      // Asegúrate de ocultar el loader en caso de error también
      setIsLoading(false);
    }
  };
  
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      throw new Error('Fecha inválida');
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filtrar filas por término de búsqueda, ubicaciones seleccionadas y rango de fechas
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      (row.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.responsable || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.ubicacion_inicial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.ubicacion_final || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocationInitial = !selectedLocationInitial || row.ubicacion_inicial === selectedLocationInitial.value;
    const matchesLocationFinal = !selectedLocationFinal || row.ubicacion_final === selectedLocationFinal.value;

    let fechaTraslado = row.fecha ? new Date(row.fecha) : null;
    let cumpleFechaInicio = true;
    let cumpleFechaFin = true;

    if (fromDate) {
      const from = new Date(fromDate);
      cumpleFechaInicio = fechaTraslado >= from;
    }

    if (toDate) {
      const to = new Date(toDate);
      cumpleFechaFin = fechaTraslado <= to;
    }

    return (
      matchesSearch &&
      matchesLocationInitial &&
      matchesLocationFinal &&
      cumpleFechaInicio &&
      cumpleFechaFin
    );
  });

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    switch(value) {
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
    }
  };
  return (
    <>
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

      <div className="mb-6 m-5">
        <h1 className="text-3xl font-bold text-center text-black mb-10">Traslados</h1>
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
          <div className="flex flex-col md:flex-row items-stretch space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por descripción, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ButtonGroup filteredData={filteredRows} allData={rows} />
              <ExcelExportButton filteredData={filteredRows} allData={rows} />
            </div>
          </div>




          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación Inicial</label>
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
              <label className="block text-sm font-medium text-gray-700">Ubicación Final</label>
              <Select
                  options={ubicaciones}
                  value={selectedLocationFinal}
                  onChange={setSelectedLocationFinal}
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

          {/* Tabla */}
          <div className="overflow-x-auto">
          <AuxMaintenanceTable
            headers={headers}
            
            rows={filteredRows}
            onDelete={handleDeleteConfirmation} // Changed to open confirmation modal
            disableFields={['id']}
          />
        </div>
        </div>
        </div>

        {/* Confirmation Modal */}
    <ModalConfirmacion
    isOpen={isModalConfirmacionOpen}
    onClose={() => setIsModalConfirmacionOpen(false)}
    onConfirm={handleDelete}
    message="¿Estás seguro de que deseas eliminar este traslado?"
  />
</>
)}
      </DashboardLayout>
    </>
  );
};

export default Moduloadmin;
