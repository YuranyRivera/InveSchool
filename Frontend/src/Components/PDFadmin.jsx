import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  
    const imagePath = '/Img/encabezado.png';
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      const imgWidth = 190;
      const imgHeight = (img.height * imgWidth) / img.width;
      const x = (doc.internal.pageSize.width - imgWidth) / 2;
      const y = 10;
  
      doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
  
      const titleY = y + imgHeight + 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Traslados', doc.internal.pageSize.width / 2, titleY, { align: 'center' });
  
      doc.autoTable({
        startY: titleY + 15,
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        theme: 'striped',
        headStyles: {
          fillColor: [0, 163, 5],
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
  
    img.onerror = () => {
      alert('Error al cargar la imagen');
    };
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

export default PDFadmin;