import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { drawPdfHeader } from '../utils/pdfHeader';

const PDFadmin = ({ filteredData, allData }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
    const dataToExport = filteredData.length > 0 ? filteredData : allData;
  
    if (dataToExport.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
  
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Fecha', dataKey: 'fecha' },
      { header: 'Ubicación Inicial', dataKey: 'ubicacion_inicial' },
      { header: 'Producto', dataKey: 'producto' },
      { header: 'Ubicación Final', dataKey: 'ubicacion_final' },
      { header: 'Responsable', dataKey: 'responsable' },
    ];
  
    const rows = dataToExport.map((item) => ({
      id: item.id || '',
      fecha: item.fecha && !isNaN(new Date(item.fecha).getTime()) 
      ? new Date(item.fecha).toISOString().split('T')[0] 
      : 'Fecha inválida',
    
      ubicacion_inicial: item.ubicacion_inicial || '',
      producto: item.producto || '',
      ubicacion_final: item.ubicacion_final || '',
      responsable: item.responsable || '',
    }));
  
    const y = 10;
    const headerEndY = drawPdfHeader(doc, { marginTop: y });

    const titleY = headerEndY + 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Traslados', doc.internal.pageSize.width / 2, titleY, { align: 'center' });

    doc.autoTable({
      startY: titleY + 15,
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
      },
    });

    doc.save('reporte_traslados.pdf');
  };

  return (
    <button
      className="bg-white text-[#3B82F6] py-2 px-4 border-2 border-[#3B82F6] rounded hover:text-white hover:bg-[#3B82F6]"
      onClick={exportToPDF}
    >
      <i className="fas fa-file-pdf mr-2"></i> PDF
    </button>
  );
};

export default PDFadmin;