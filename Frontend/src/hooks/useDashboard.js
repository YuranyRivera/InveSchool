import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const useDashboard = () => {
  const [totalArticulosActivos, setTotalArticulosActivos] = useState(0);
  const [totalArticulosInactivos, setTotalArticulosInactivos] = useState(0);
  const [totalArticulosAlmacenamiento, setTotalArticulosAlmacenamiento] = useState(0);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHistorialBajas, setTotalHistorialBajas] = useState(0);

  const resumenHeaders = ['Artículos Totales', 'Artículos Administrativos', 'Artículos Aux. Mantenimiento'];
  const actividadHeaders = ['Fecha ', 'Tipo de reporte', 'Descripcion'];

  const pieData = {
    labels: ['Artículos Activos', 'Artículos Inactivos'],
    datasets: [
      {
        label: 'Distribución de Artículos',
        data: [totalArticulosActivos, totalArticulosInactivos],
        backgroundColor: ['#00A305', '#FF5733'],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Artículos Activos', 'Artículos Inactivos'],
    datasets: [
      {
        label: 'Cantidad',
        data: [totalArticulosAlmacenamiento, totalHistorialBajas],
        backgroundColor: ['#00A305', '#FF5733'],
        borderColor: ['#FFEB50', '#FF5733'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gráfico de Aux Mantenimiento',
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          activosResponse,
          inactivosResponse,
          almacenamientoResponse,
          historialResponse,
          actividadResponse,
        ] = await Promise.all([
          fetch('https://inventarioschool-v1.onrender.com/api/total-activos'),
          fetch('https://inventarioschool-v1.onrender.com/api/total-inactivos'),
          fetch('https://inventarioschool-v1.onrender.com/api/total-articulos-almacenamiento'),
          fetch('https://inventarioschool-v1.onrender.com/api/total-historial-bajas'),
          fetch('https://inventarioschool-v1.onrender.com/api/ultimo-registro'),
        ]);

        const activosData = await activosResponse.json();
        const inactivosData = await inactivosResponse.json();
        const almacenamientoData = await almacenamientoResponse.json();
        const historialData = await historialResponse.json();
        const actividadData = await actividadResponse.json();

        setTotalArticulosActivos(activosData.total_activos);
        setTotalArticulosInactivos(inactivosData.total_inactivos);
        setTotalArticulosAlmacenamiento(almacenamientoData.total_registros);
        setTotalHistorialBajas(historialData.total_historial);

        if (actividadData) {
          const fechaFormateada = new Date(actividadData.fecha).toLocaleDateString();
          setActividadReciente([
            [fechaFormateada, actividadData.tipo_tabla, actividadData.descripcion],
          ]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    isLoading,
    resumenHeaders,
    actividadHeaders,
    totalArticulosActivos,
    totalArticulosInactivos,
    totalArticulosAlmacenamiento,
    actividadReciente,
    totalHistorialBajas,
    pieData,
    barData,
    barOptions,
  };
};

export default useDashboard;