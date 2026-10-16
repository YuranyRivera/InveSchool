import { notify } from '@/lib/notify';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const TransfersPdfButton = ({ filteredData, allData }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
    const dataToExport = filteredData.length > 0 ? filteredData : allData;
  
    if (dataToExport.length === 0) {
      notify('No hay datos para exportar', 'info');
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
  
    const imagePath = '/images/pdf-header.png';
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
  
      autoTable(doc, {
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
  
    img.onerror = () => {
      notify('Error al cargar la imagen', 'error');
    };
  };

  return (
    <button
      className="btn-secondary"
      onClick={exportToPDF}
    >
      <i className="fas fa-file-pdf text-subtle"></i> PDF
    </button>
  );
};

export default TransfersPdfButton;