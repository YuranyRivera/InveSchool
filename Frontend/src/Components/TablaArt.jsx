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
    <div className="mt-6 w-full">
      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden md:block overflow-x-auto">
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
                    <td key={idx} className="px-4 py-2 truncate max-w-xs">{cell}</td>
                  ))
                )}
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {index === editingRowIndex ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-[#00A305] text-white py-1 px-3 rounded flex items-center hover:bg-green-700 transition-colors text-sm"
                        >
                          <i className="fas fa-save mr-1"></i> Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-red-500 text-white py-1 px-3 rounded flex items-center hover:bg-red-700 transition-colors text-sm"
                        >
                          <i className="fas fa-times mr-1"></i> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onDelete(row)}
                          className="bg-white text-[#00A305] py-1 px-3 border border-[#00A305] rounded flex items-center hover:bg-green-100 transition-colors text-sm"
                        >
                          <i className="fas fa-trash-alt mr-1"></i> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista en tarjetas para pantallas pequeñas */}
      <div className="block md:hidden space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-md p-4 bg-white"
          >
            {Object.entries(row).map(([key, value], idx) => {
              // No mostrar campos con IDs o valores muy técnicos en la vista móvil
              if (key.toLowerCase() === 'id') return null;
              
              return (
                <div key={idx} className="py-2 border-b last:border-b-0">
                  <div className="text-sm font-medium text-gray-600">{headers[idx]}</div>
                  {index === editingRowIndex ? (
                    <input
                      type="text"
                      value={editedRowData[key.toLowerCase()] || ''}
                      onChange={(e) => handleInputChange(e, key.toLowerCase())}
                      disabled={disabledFields.includes(key.toLowerCase())}
                      className={`mt-1 border px-2 py-1 rounded w-full ${
                        disabledFields.includes(key.toLowerCase())
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : ''
                      }`}
                    />
                  ) : (
                    <div className="mt-1 font-medium break-words">{value}</div>
                  )}
                </div>
              );
            })}
            
            <div className="mt-4 flex space-x-2">
              {index === editingRowIndex ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-[#00A305] text-white py-2 px-3 rounded flex-1 hover:bg-green-700 transition-colors flex justify-center items-center"
                  >
                    <i className="fas fa-save mr-2"></i> Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white py-2 px-3 rounded flex-1 hover:bg-red-700 transition-colors flex justify-center items-center"
                  >
                    <i className="fas fa-times mr-2"></i> Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onDelete(row)}
                    className="bg-white text-[#00A305] py-2 px-3 border border-[#00A305] rounded flex-1 hover:bg-green-100 transition-colors flex justify-center items-center"
                  >
                    <i className="fas fa-trash-alt mr-2"></i> Eliminar
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