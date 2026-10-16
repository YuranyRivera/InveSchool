import { useState, useEffect } from 'react';
import { LOCATIONS } from '@/constants/locations';
import RecordsHeader from '@/features/records/components/RecordsHeader';
import RecordsTable from '@/features/records/components/RecordsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search } from 'lucide-react';
import Select from 'react-select';
import selectStyles from '@/theme/selectStyles';
import DateInput from '@/components/form/DateInput';
import TransfersPdfButton from '@/features/records/components/TransfersPdfButton';
import TransfersExcelButton from '@/features/records/components/TransfersExcelButton';
import API_URL, { apiFetch } from '@/lib/apiClient';
import ConfirmDialog from '@/components/feedback/ConfirmDialog';
const TransfersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const headers = ['ID','Fecha', 'Ubicación inicial', 'Producto',  'Código', 'Ubicación final', 'Responsable'];
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationInitial, setSelectedLocationInitial] = useState('');
  const [selectedLocationFinal, setSelectedLocationFinal] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isModalConfirmacionOpen, setIsModalConfirmacionOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const ubicaciones = LOCATIONS;


  useEffect(() => {
    const fetchTraslados = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch(`${API_URL}/api/traslados`);
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

  const handleDeleteConfirmation = (row) => {
    setRowToDelete(row);
    setIsModalConfirmacionOpen(true);
  };
  
  const handleDelete = async () => {
    if (!rowToDelete) return;
  
    setIsLoading(true); // Mostrar el loader
    const id = rowToDelete.id;
  
    try {
      const response = await apiFetch(`${API_URL}/api/traslados/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el traslado');
      }
  
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

  return (
    <>
      <DashboardLayout>
     
      {isLoading ? (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-line border-t-accent rounded-full animate-spin"></div>
  </div>
) : (
  <>

      <div>
        <RecordsHeader title="Traslados" description="Movimientos de artículos administrativos entre ubicaciones." />


        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      
                <Search className="h-5 w-5 text-subtle" />
              </div>
              <input
                type="text"
                placeholder="Buscar por descripción, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <TransfersPdfButton filteredData={filteredRows} allData={rows} />
              <TransfersExcelButton filteredData={filteredRows} allData={rows} />
            </div>
          </div>




          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Ubicación inicial</label>
              <Select styles={selectStyles}
                  options={ubicaciones}
                  value={selectedLocationInitial}
                  onChange={setSelectedLocationInitial}
                  isClearable
                  placeholder="Seleccionar ubicación..."
                  className="text-sm"
                />
            </div>
            <div>
              <label className="label">Ubicación final</label>
              <Select styles={selectStyles}
                  options={ubicaciones}
                  value={selectedLocationFinal}
                  onChange={setSelectedLocationFinal}
                  isClearable
                  placeholder="Seleccionar ubicación..."
                  className="text-sm"
                />
            </div>
            <div>
              <label className="label">Desde</label>
              <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Hasta</label>
              <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
          <RecordsTable
            headers={headers}
            
            // La fecha se guarda como AAAA-MM-DD (sirve para filtrar); aquí solo se muestra en formato local.
            rows={filteredRows.map((row) => ({ ...row, fecha: row.fecha.split('-').reverse().join('/') }))}
            onDelete={handleDeleteConfirmation}
            disableFields={['id']}
          />
        </div>
        </div>
        </div>

        {/* Confirmation Modal */}
    <ConfirmDialog
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

export default TransfersPage;
