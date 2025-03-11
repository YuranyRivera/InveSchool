import React from 'react';
import * as XLSX from 'xlsx';

const ExcelExportButton = ({ filteredData, allData }) => {
  const exportToExcel = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : allData;

    // Preparar los datos específicos para el reporte
    const rows = dataToExport.map((item) => ({
      ID: item.id || '',
      Fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '',
      'Ubicación Inicial': item.ubicacion_inicial || '',
      Producto: item.producto || '',
      'Ubicación Final': item.ubicacion_final || '',
      Responsable: item.responsable || '',
    }));

    // Crear un libro de trabajo y una hoja
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Traslados');

    // Exportar el archivo Excel
    XLSX.writeFile(workbook, 'reporte_traslados.xlsx');
  };

  return (
    <button
      onClick={exportToExcel}
      className="bg-[#00A305] text-white py-2 px-4 rounded hover:bg-green-700"
    >
      <i className="fas fa-file-excel mr-2"></i> Excel
    </button>
  );
};

export default ExcelExportButton;