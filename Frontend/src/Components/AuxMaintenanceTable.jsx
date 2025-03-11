import React from 'react';
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
const AuxMaintenanceTable = ({ 
  headers,
  rows,
  onEdit,
  onDelete,
  editingRowIndex,
  editedRowData,
  handleInputChange,
  handleSave,
  handleCancel,
}) => {
  // Lista de campos deshabilitados
  const disabledFields = ['id', 'cantidad', 'cantidad_productos'];

    const generateBarcodePDF = (codigo) => {
      const doc = new jsPDF();
      const canvas = document.createElement("canvas");
  
      JsBarcode(canvas, codigo, { format: "CODE128" });
      const barcodeImage = canvas.toDataURL("image/png");
  
      doc.addImage(barcodeImage, "PNG", 10, 20, 50, 20);
      doc.save(`barcode_${codigo}.pdf`);
    };
  return (
    <div className="mt-10">
      {/* Tabla para pantallas grandes */}
      <div className="hidden md:block">
        <table className="min-w-full table-auto rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-[#00A305] text-white">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left">
                  {header}
                </th>
              ))}
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`border-t ${
                  index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-100'
                } hover:bg-gray-200 transition-colors`}
              >
                {index === editingRowIndex ? (
                  // Mostrar inputs para editar
                  Object.entries(row).map(([key, value], idx) => {
                    const field = key.toLowerCase(); 
                    const isDisabled = disabledFields.includes(field); 
                    return (
                      <td key={idx} className="px-4 py-2">
                        <input
                          type="text"
                          value={editedRowData[field] || ''}
                          onChange={(e) => handleInputChange(e, field)}
                          disabled={isDisabled}
                          className={`border px-2 py-1 rounded w-full ${
                            isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                    );
                  })
                ) : (
                  // Mostrar datos de la fila
                  Object.values(row).map((cell, idx) => (
                    <td key={idx} className="px-4 py-2">{cell}</td>
                  ))
                )}
                <td className="px-4 py-2 flex space-x-2">
                  {index === editingRowIndex ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-[#00A305] text-white py-1 px-3 rounded flex items-center hover:bg-green-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-red-500 text-white py-1 px-3 rounded flex items-center hover:bg-red-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(row, index)}
                        className="bg-[#00A305] text-white py-1 px-3 rounded flex items-center hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-pencil-alt mr-2"></i>
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="bg-white text-[#00A305] py-1 px-3 border-2 border-[#00A305] rounded flex items-center hover:bg-green-100 transition-colors"
                      >
                         <i className="fas fa-trash-alt mr-2"></i> 
                        Eliminar
                      </button>
                      <button
                        onClick={() => generateBarcodePDF(row.codigo)}
                        className="bg-blue-500 text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-blue-700 transition-colors"
                      >
                        <i className="fas fa-barcode mr-1 md:mr-2"></i> Código
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista en tarjetas para pantallas pequeñas */}
      <div className="block md:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-md p-4 mb-4 bg-gray-100"
          >
            {Object.entries(row).map(([key, value], idx) => (
              <div key={idx} className="flex justify-between mb-2">
                <span className="font-bold">{headers[idx]}:</span>
                {index === editingRowIndex ? (
                  <input
                    type="text"
                    value={editedRowData[key.toLowerCase()] || ''}
                    onChange={(e) => handleInputChange(e, key.toLowerCase())}
                    disabled={disabledFields.includes(key.toLowerCase())}
                    className={`border px-2 py-1 rounded w-1/2 ${
                      disabledFields.includes(key.toLowerCase())
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : ''
                    }`}
                  />
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
            <div className="flex space-x-2">
              {index === editingRowIndex ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-[#00A305] text-white py-1 px-3 rounded flex-1 hover:bg-green-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white py-1 px-3 rounded flex-1 hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(row, index)}
                    className="bg-[#00A305] text-white py-1 px-3 rounded flex-1 hover:bg-green-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="bg-white text-[#00A305] py-1 px-3 border-2 border-[#00A305] rounded flex-1 hover:bg-green-100 transition-colors"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => generateBarcodePDF(row.codigo)}
                    className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition"
                  >
                    Código
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuxMaintenanceTable;