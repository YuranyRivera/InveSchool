import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const PDFExportButton = ({ filteredData, allData }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dataToExport = filteredData.length > 0 ? filteredData : allData;

    // Configurar las columnas específicas para el reporte
    const columns = [
      'ID',
      'Producto/Detalle',
      'Cantidad Inicial',
      'Módulo',
      'Estante',
      'Estado',
      'Entrada',
      'Salida',
      'Restante',
    ];

    // Preparar los datos específicos para el reporte
    const rows = dataToExport.map((articulo) => [
      articulo.id,
      articulo.producto || '',
      articulo.cantidad_productos || 0,
      articulo.modulo || '',
      articulo.estante || '',
      articulo.estado || '',
      articulo.entrada || 0,
      articulo.salida || 0,
      articulo.cantidad || 0,
    ]);

    // Agregar título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE ALMACENAMIENTO', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Texto con la fecha de generación
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const generationDate = `Fecha de Generación: ${new Date().toLocaleDateString()}`;
    doc.text(generationDate, 15, 30);

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
        textColor: [255, 255, 255],
      },
      margin: { top: 10 },
    });

    // Guardar el archivo PDF
    doc.save('reporte_almacenamiento.pdf');
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
