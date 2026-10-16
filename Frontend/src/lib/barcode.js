import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

/** Genera y descarga un PDF con el código de barras (CODE128) del artículo. */
export const downloadBarcodePDF = (codigo) => {
  const doc = new jsPDF();
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, codigo, { format: 'CODE128' });
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 20, 50, 20);
  doc.save(`barcode_${codigo}.pdf`);
};
