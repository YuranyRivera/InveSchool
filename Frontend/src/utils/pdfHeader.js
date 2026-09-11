// Encabezado azul de InveSchool para los reportes exportados en PDF.
// Se dibuja directamente con jsPDF (sin depender de una imagen externa),
// por lo que no requiere esperar a que cargue ningún archivo.
export const PDF_PRIMARY_COLOR = [59, 130, 246]; // Igual al azul de la marca (#3B82F6)

/**
 * Dibuja el encabezado de marca en un documento jsPDF y devuelve la
 * posición Y (en mm) justo debajo del encabezado, para seguir maquetando ahí.
 */
export const drawPdfHeader = (doc, { marginTop = 10 } = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  const bannerWidth = 190;
  const bannerHeight = 26;
  const x = (pageWidth - bannerWidth) / 2;

  doc.setFillColor(...PDF_PRIMARY_COLOR);
  doc.roundedRect(x, marginTop, bannerWidth, bannerHeight, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('InveSchool', pageWidth / 2, marginTop + 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Sistema de Gestion de Inventario', pageWidth / 2, marginTop + 21, { align: 'center' });

  doc.setTextColor(0, 0, 0); // Restaurar color de texto para el resto del documento

  return marginTop + bannerHeight;
};
