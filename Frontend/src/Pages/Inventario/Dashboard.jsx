import React from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import Table from '../../Components/Table';
import { Pie, Bar } from 'react-chartjs-2';
import '@dotlottie/player-component';
import useDashboard from '../../hooks/useDashboard';

const Dashboard = () => {
  const {
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
  } = useDashboard();

  // Ajuste de encabezados para versiones largas/cortas en pantallas grandes y pequeñas
  const adjustedResumenHeaders = resumenHeaders.map((header) => {
    if (header === 'Artículos Administrativos') {
      return (
        <div>
          <span className="sm:inline hidden">Artículos Administrativos</span>
          <span className="sm:hidden">Artículos Admin</span>
        </div>
      );
    }
    if (header === 'Artículos Aux. Mantenimiento') {
      return (
        <div>
          <span className="sm:inline hidden">Artículos Aux. Mantenimiento</span>
          <span className="sm:hidden">Artículos Aux</span>
        </div>
      );
    }
    return header;
  });

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center text-black mt-20">Tablero</h1>
            <div className="overflow-x-auto">
              <Table
                title="Resumen de Inventario"
                headers={adjustedResumenHeaders}
                rows={[
                  [
                    <div className="">
                      {parseInt(totalArticulosActivos) + parseInt(totalArticulosAlmacenamiento)}
                    </div>,
                    <div className="">{totalArticulosActivos}</div>,
                    <div className="">{totalArticulosAlmacenamiento}</div>,
                  ],
                ]}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table
                title="Actividad Reciente"
                headers={actividadHeaders}
                rows={actividadReciente.map((row) =>
                  row.map((data) => <div className="">{data}</div>)
                )}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="w-full md:w-1/2 mb-6 md:mb-0 md:mr-4">
                <div className="bg-white h-64 rounded-lg p-4">
                  <label>Gráfico de Administración:</label>
                  <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-white h-64 rounded-lg p-4">
                  <Bar
                    data={barData}
                    options={{ ...barOptions, responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
