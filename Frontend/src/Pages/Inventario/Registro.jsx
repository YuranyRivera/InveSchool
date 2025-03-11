import React, { useEffect, useState } from 'react';
import TableEntrada from '../../Components/TableEntrada';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import '@dotlottie/player-component';

const Example = () => {
  const headers = ['ID', 'Fecha', 'Cantidad de productos', 'Tipo de Registro'];
  const [rows, setRows] = useState([]);
  const [selectedOption, setSelectedOption] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReporteGeneral = async () => {
      // Only show loader when first entering the page
      setIsLoading(true);
      
      try {
        const response = await fetch('https://inventarioschool-v1.onrender.com/api/reporte-general');
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

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    switch(value) {
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
        // Do nothing when 'general' is selected
        break;
    }
  };

  const reloadArticulos = () => {
    // Reload data from API or refresh page
    window.location.reload();
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
        <div className="p-4 sm:m-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-black mb-6 sm:mb-10">
            Registro General De Entradas y Salidas
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

          <TableEntrada 
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

export default Example;