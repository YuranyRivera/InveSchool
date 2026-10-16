import { useState, useEffect } from 'react';
import { CHART_COLORS } from '@/theme/charts';
import API_URL, { apiFetch } from '@/lib/apiClient';

const useDashboard = () => {
  const [totalArticulosActivos, setTotalArticulosActivos] = useState(0);
  const [totalArticulosInactivos, setTotalArticulosInactivos] = useState(0);
  const [totalArticulosAlmacenamiento, setTotalArticulosAlmacenamiento] = useState(0);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHistorialBajas, setTotalHistorialBajas] = useState(0);

  const actividadHeaders = ['Fecha', 'Tipo de reporte', 'Descripción'];

  const pieData = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        label: 'Artículos administrativos',
        data: [totalArticulosActivos, totalArticulosInactivos],
        backgroundColor: [CHART_COLORS.primary, CHART_COLORS.muted],
        borderColor: CHART_COLORS.surface,
        borderWidth: 3,
      },
    ],
  };

  const barData = {
    labels: ['En almacén', 'Dados de baja'],
    datasets: [
      {
        label: 'Cantidad',
        data: [totalArticulosAlmacenamiento, totalHistorialBajas],
        backgroundColor: [CHART_COLORS.primary, CHART_COLORS.muted],
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  };

  const pieOptions = {
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
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
          apiFetch(`${API_URL}/api/total-activos`),
          apiFetch(`${API_URL}/api/total-inactivos`),
          apiFetch(`${API_URL}/api/total-articulos-almacenamiento`),
          apiFetch(`${API_URL}/api/total-historial-bajas`),
          apiFetch(`${API_URL}/api/ultimo-registro`),
        ]);

        const activosData = await activosResponse.json();
        const inactivosData = await inactivosResponse.json();
        const almacenamientoData = await almacenamientoResponse.json();
        const historialData = await historialResponse.json();
        const actividadData = await actividadResponse.json();

        setTotalArticulosActivos(Number(activosData.total_activos) || 0);
        setTotalArticulosInactivos(Number(inactivosData.total_inactivos) || 0);
        setTotalArticulosAlmacenamiento(Number(almacenamientoData.total_registros) || 0);
        setTotalHistorialBajas(Number(historialData.total_historial) || 0);

        if (Array.isArray(actividadData)) {
          setActividadReciente(
            actividadData.map((evento) => [
              new Date(evento.fecha).toLocaleDateString('es-CO'),
              evento.tipo_tabla,
              evento.descripcion,
            ])
          );
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    isLoading,
    actividadHeaders,
    totalArticulosActivos,
    totalArticulosInactivos,
    totalArticulosAlmacenamiento,
    actividadReciente,
    totalHistorialBajas,
    pieData,
    pieOptions,
    barData,
    barOptions,
  };
};

export default useDashboard;
