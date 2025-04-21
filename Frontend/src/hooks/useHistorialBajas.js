// useHistorialBajas.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const useHistorialBajas = (createImageButton, createPDFButton) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('bajas2');
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedRowToDelete, setSelectedRowToDelete] = useState(null);

  const headers = ['ID', 'Codigo', 'Artículo', 'Motivo de Baja', 'Fecha de Baja', 'Usuario', 'Imagen', 'Exportar'];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchHistorialBajas = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos-baja-historial');
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      const mappedRows = data.map((item) => [
        item.id,
        item.codigo,
        item.producto,
        item.motivo_baja,
        formatDate(item.fecha_baja),
        item.usuario_baja,
        createImageButton(item.imagen_baja, () => setSelectedImage(item.imagen_baja)),
        createPDFButton([
          item.id,
          item.producto,
          item.motivo_baja,
          formatDate(item.fecha_baja),
          item.usuario_baja,
          item.imagen_baja
        ])
      ]);
      setRows(mappedRows);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setIsLoading(false);
    }
  };

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    const routes = {
      general: '/registro',
      traslados: '/moduloadmin',
      bajas: '/articulosbaja',
      bajas2: '/articulosbaja2',
        reporte: '/reporte'
    };

    if (routes[value]) {
      navigate(routes[value]);
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedRowToDelete(row);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    const id = selectedRowToDelete[0];
    try {
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/articulos_baja_historial/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el artículo');
      }

      setTimeout(async () => {
        await fetchHistorialBajas();
        setIsLoading(false);
      }, 1000);
      
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error al eliminar el artículo:', error);
      setIsLoading(false);
    }
  };

  const filteredRows = rows.filter((row) => {
    const searchFields = [
      row[1] || '', // Artículo
      row[2] || '', // Motivo
      row[4] || '', // Usuario
    ];
    
    const matchesSearch = searchTerm === '' || searchFields.some(field => 
      field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    let rowDate = row[3] ? new Date(row[3].split('/').reverse().join('-')) : null;
    let fromDateObj = fromDate ? new Date(fromDate) : null;
    let toDateObj = toDate ? new Date(toDate) : null;

    if (rowDate) rowDate.setHours(0, 0, 0, 0);
    if (fromDateObj) fromDateObj.setHours(0, 0, 0, 0);
    if (toDateObj) toDateObj.setHours(0, 0, 0, 0);

    const matchesFromDate = !fromDateObj || (rowDate && rowDate >= fromDateObj);
    const matchesToDate = !toDateObj || (rowDate && rowDate <= toDateObj);

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
    const columns = ['ID', 'Producto', 'Motivo de Baja', 'Fecha de Baja', 'Usuario Baja'];
  
    // Filtrar filas eliminando la columna de imagen y botón de exportación
    const dataRows = rows.map(row => row.slice(0, 5));
  
    // Cargar la imagen del encabezado
    const imagePath = '/Img/encabezado.png';
    const img = new Image();
    img.src = imagePath;
  
    img.onload = () => {
      const imgWidth = 190;
      const imgHeight = (img.height * imgWidth) / img.width;
      const x = (doc.internal.pageSize.width - imgWidth) / 2;
      const y = 10;
  
      doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
  
      // Título del reporte
      const titleY = y + imgHeight + 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Historial de Artículos Dados de Baja', doc.internal.pageSize.width / 2, titleY, { align: 'center' });
  
      // Generar la tabla con autoTable
      doc.autoTable({
        startY: titleY + 15,
        head: [columns],  // Encabezados
        body: dataRows,   // Datos corregidos
        theme: 'striped',
        headStyles: { fillColor: [0, 163, 5], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle' },
        columnStyles: {
          // Ajustar el ancho de la columna "Motivo de Baja" y permitir el salto de línea
          2: { cellWidth: 60, fontStyle: 'normal', overflow: 'linebreak' } // Ancho fijo para la columna
        },
        didDrawCell: (data) => {
          // Asegurarse de que el texto se ajuste correctamente en la celda
          if (data.column.index === 2 && data.cell.raw.length > 50) {
            data.cell.text = data.cell.raw; // Forzar el ajuste del texto
          }
        }
      });
  
      doc.save('historial_bajas.pdf');
    };
  };
  
  
  
  

  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...filteredRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
    XLSX.writeFile(workbook, 'historial_bajas.xlsx');
  };

  const handleRowPDF = (row) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const colors = {
      primary: [0, 163, 5], 
      secondary: [88, 88, 88],
      text: [51, 51, 51],
      accent: [242, 242, 242]
    };
  
    const styles = {
      header: {
        fontSize: 20,
        fontStyle: 'bold',
        color: colors.primary
      },
      subheader: {
        fontSize: 14,
        fontStyle: 'bold',
        color: colors.secondary
      },
      normal: {
        fontSize: 11,
        fontStyle: 'normal',
        color: colors.text
      }
    };
  
    const addWrappedText = (text, x, y, maxWidth) => {
      doc.setFontSize(styles.normal.fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return (lines.length * 7); // Retorna el alto total del texto
    };
  
    const loadImage = (imagePath) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imagePath;
      });
    };
  
    const addHeader = async () => {
      try {
        const headerImage = await loadImage('/Img/encabezado.png');
        const imgWidth = 190;
        const imgHeight = (headerImage.height * imgWidth) / headerImage.width;
        const x = (doc.internal.pageSize.width - imgWidth) / 2;
        doc.addImage(headerImage, 'PNG', x, 10, imgWidth, imgHeight);
        return 10 + imgHeight;
      } catch (error) {
        console.error('Error al cargar el encabezado:', error);
        return 10;
      }
    };
  
    const addTitle = (yPosition) => {
      doc.setFillColor(...colors.accent);
      doc.rect(0, yPosition, doc.internal.pageSize.width, 15, 'F');
      
      doc.setFontSize(styles.header.fontSize);
      doc.setFont('helvetica', styles.header.fontStyle);
      doc.setTextColor(...colors.primary);
      doc.text('Reporte de Baja', doc.internal.pageSize.width / 2, yPosition + 10, { align: 'center' });
      
      return yPosition + 25;
    };
  
    const addDetails = (yPosition) => {
      const columns = [
        { label: 'ID', value: row[0] },
        { label: 'Artículo', value: row[1] },
        { label: 'Fecha de Baja', value: row[3] },
        { label: 'Usuario', value: row[4] }
      ];
  
      let currentY = yPosition;
  
      columns.forEach((col) => {
        doc.setFontSize(styles.subheader.fontSize);
        doc.setFont('helvetica', styles.subheader.fontStyle);
        doc.setTextColor(...colors.secondary);
        doc.text(col.label, 20, currentY);
        
        doc.setFontSize(styles.normal.fontSize);
        doc.setFont('helvetica', styles.normal.fontStyle);
        doc.setTextColor(...colors.text);
        doc.text(col.value?.toString() || '', 60, currentY);
        
        currentY += 10;
      });
  
      currentY += 5;
      doc.setFontSize(styles.subheader.fontSize);
      doc.setFont('helvetica', styles.subheader.fontStyle);
      doc.setTextColor(...colors.secondary);
      doc.text('Motivo de Baja:', 20, currentY);
      
      currentY += 7;
      const textHeight = addWrappedText(
        row[2]?.toString() || '',
        20,
        currentY,
        170 // Ancho máximo para el texto
      );
  
      return currentY + textHeight + 10;
    };
  
    const addImage = async (yPosition) => {
      if (row[5] && typeof row[5] === 'string') {
        try {
          const img = await loadImage(row[5]);
          
          doc.setFillColor(...colors.accent);
          doc.rect(20, yPosition - 5, 170, 90, 'F');
          
          doc.setFontSize(styles.subheader.fontSize);
          doc.setFont('helvetica', styles.subheader.fontStyle);
          doc.setTextColor(...colors.secondary);
          doc.text('Imagen del Artículo:', 30, yPosition + 5);
          
          const maxWidth = 150;
          const maxHeight = 70;
          let imgWidth = maxWidth;
          let imgHeight = (img.height * maxWidth) / img.width;
          
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = (img.width * maxHeight) / img.height;
          }
          
          const x = 30 + (maxWidth - imgWidth) / 2;
          doc.addImage(img, 'PNG', x, yPosition + 10, imgWidth, imgHeight);
        } catch (error) {
          doc.setTextColor(180, 0, 0);
          doc.text('Imagen no disponible', 30, yPosition + 30);
        }
      }
    };
  
    const generatePDF = async () => {
      let currentY = await addHeader();
      currentY = addTitle(currentY);
      currentY = addDetails(currentY);
      await addImage(currentY);
      
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...colors.secondary);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`baja_${row[0]}.pdf`);
    };
  
    generatePDF();
  };

  useEffect(() => {
    fetchHistorialBajas();
  }, []);

  return {
    isLoading,
    selectedOption,
    headers,
    filteredRows,
    searchTerm,
    fromDate,
    toDate,
    selectedImage,
    showDeleteConfirmation,
    setSearchTerm,
    setFromDate,
    setToDate,
    setSelectedImage,
    handleOptionChange,
    handleDeleteClick,
    handleConfirmDelete,
    setShowDeleteConfirmation,
    exportToPDF,
    exportToExcel,
    handleRowPDF
  };
};