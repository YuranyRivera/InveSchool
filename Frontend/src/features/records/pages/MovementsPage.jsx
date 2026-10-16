import { useEffect, useState } from 'react';
import RecordsHeader from '@/features/records/components/RecordsHeader';
import MovementsTable from '@/features/records/components/MovementsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import API_URL, { apiFetch } from '@/lib/apiClient';

const MovementsPage = () => {
  const headers = ['ID', 'Fecha', 'Cantidad de productos', 'Tipo de registro'];
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReporteGeneral = async () => {
      // Only show loader when first entering the page
      setIsLoading(true);
      
      try {
        const response = await apiFetch(`${API_URL}/api/reporte-general`);
        if (!response.ok) {
          throw new Error('Error al obtener el reporte general');
        }
        const data = await response.json();
        const mappedRows = data.map((item) => [
          item.id,
          item.fechaEntrada,
          item.cantidadProductos,
          item.estado,
        ]);
        setRows(mappedRows);
        
        // Hide loader after 2 seconds
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error al obtener el reporte general:', error);
        setIsLoading(false);
      }
    };

    fetchReporteGeneral();
  }, []); // Empty dependency array ensures this runs only on initial load


  const reloadArticulos = () => {
    // Reload data from API or refresh page
    window.location.reload();
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-line border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          <RecordsHeader title="Movimientos" description="Entradas y salidas de productos del almacén." />

          <MovementsTable 
            headers={headers} 
            rows={rows} 
            setRows={setRows} 
            reloadArticulos={reloadArticulos} 
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default MovementsPage;