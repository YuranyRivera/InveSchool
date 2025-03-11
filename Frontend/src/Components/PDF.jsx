import React from 'react';
import { jsPDF } from 'jspdf';

const PDFExportButton = ({ filteredData, allData }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dataToExport = filteredData.length > 0 ? filteredData : allData;

    // Configurar las columnas específicas para el reporte
    const columns = [
      'ID', 
      'Fecha', 
      'Descripción', 
      'Proveedor', 
      'Ubicación', 
      'Observación', 
      'Precio'
    ];

    // Función para formatear el precio en formato colombiano
    const formatCurrency = (value) => {
      if (value == null || isNaN(value)) return '0.00'; // Verificar si es un valor válido
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Preparar los datos específicos para el reporte
    const rows = dataToExport.map(item => [
      item.id,
      item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '',
      item.descripcion || '',
      item.proveedor || '',
      item.ubicacion || '',
      item.observacion || '',
      formatCurrency(item.precio) // Formatear el precio aquí
    ]);

    // Agregar título
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE ADMINISTRATIVO", doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Texto con el nombre de la persona y la fecha al lado izquierdo
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const personaTexto = `Fecha de Generación: ${new Date().toLocaleDateString()}`;
    const leftMargin = 15;
    doc.text(personaTexto, leftMargin, 30);

    // Agregar tabla al PDF
    doc.autoTable({
      startY: 40,
      head: [columns],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [0, 163, 5],
        textColor: [255, 255, 255]
      },
      margin: { top: 10 }
    });

    // Guardar el archivo PDF
    doc.save('reporte_administrativo.pdf');
  };

  return (
    <button 
      className="bg-white text-green-600 py-2 px-4 border-2 border-green-600 rounded hover:text-white hover:bg-[#00A305]"
      onClick={exportToPDF}
    >
      <i className="fas fa-file-pdf mr-2"></i> PDF
    </button>
  );
};

export default PDFExportButton;
