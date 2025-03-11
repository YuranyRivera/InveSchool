// ExcelExportButton.js
import React from 'react';
import * as XLSX from 'xlsx';

const ExcelExportButton = ({ filteredData, allData }) => {
  const exportToExcel = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : allData;

    // Preparar los datos específicos para administración
    const rows = dataToExport.map(item => ({
      ID: item.id,
      Fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '',
      Descripción: item.descripcion || '',
      Proveedor: item.proveedor || '',
      Ubicación: item.ubicacion || '',
      Observación: item.observacion || '',
      Precio: typeof item.precio === 'number' ? item.precio.toFixed(2) : '0.00',
    }));

    // Crear un libro de trabajo y una hoja
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Administrativo');

    // Exportar el archivo Excel
    XLSX.writeFile(workbook, 'reporte_administrativo.xlsx');
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
