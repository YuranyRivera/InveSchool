import React from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const BarcodePDF = ({ articulos }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 10;

    articulos.forEach((articulo, index) => {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, articulo.codigo, { format: "CODE128" });

      const barcodeImage = canvas.toDataURL("image/png");

  
      doc.addImage(barcodeImage, "PNG", 10, yPos + 15, 50, 20);

      yPos += 40;
      if (yPos > 250) {
        doc.addPage();
        yPos = 10;
      }
    });

    doc.save("codigos_de_barras.pdf");
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-[#00A305] text-white px-4 py-2 rounded"
    >
      Generar Códigos PDF
    </button>
  );
};

export default BarcodePDF;
