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
  disableFields = []
}) => {
  const generateBarcodePDF = (codigo) => {
    const doc = new jsPDF();
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, codigo, { format: "CODE128" });
    const barcodeImage = canvas.toDataURL("image/png");
    doc.addImage(barcodeImage, "PNG", 10, 20, 50, 20);
    doc.save(`barcode_${codigo}.pdf`);
  };

  // Desktop view
  const renderDesktopTable = () => (
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
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-t ${
                rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-100'
              } hover:bg-gray-200 transition-colors`}
            >
              {/* Cell data */}
              {Object.keys(row).map((key, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-2">
                  {rowIndex === editingRowIndex ? (
                    <input
                      type="text"
                      value={editedRowData[key] !== undefined ? editedRowData[key] : row[key]}
                      onChange={(e) => handleInputChange(e, key)}
                      disabled={disableFields.includes(key)}
                      className={`border px-2 py-1 rounded w-full ${
                        disableFields.includes(key) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                    />
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
              
              {/* Action buttons */}
              <td className="px-4 py-2">
                <div className="flex space-x-2">
                  {rowIndex === editingRowIndex ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="bg-[#00A305] text-white py-1 px-3 rounded hover:bg-green-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(row, rowIndex)}
                        className="bg-[#00A305] text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-pencil-alt mr-1 md:mr-2"></i> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="bg-white text-[#00A305] py-1 px-2 md:px-3 border-2 border-[#00A305] rounded flex items-center text-xs md:text-sm hover:bg-green-100 transition-colors"
                        >
                          <i className="fas fa-trash-alt mr-1 md:mr-2"></i> Dar de baja
                      </button>
                      <button
                        type="button"
                        onClick={() => generateBarcodePDF(row.codigo)}
                        className="bg-blue-500 text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-blue-700 transition-colors"
                        >
                          <i className="fas fa-barcode mr-1 md:mr-2"></i> Código
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
  );

  // Mobile view
  const renderMobileCards = () => (
    <div className="block md:hidden">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="border rounded-lg shadow-md p-4 mb-4 bg-gray-100"
        >
          {Object.keys(row).map((key, cellIndex) => (
            <div key={`${rowIndex}-${cellIndex}`} className="flex justify-between mb-2">
              <span className="font-bold">{headers[cellIndex] || key}:</span>
              {rowIndex === editingRowIndex ? (
                <input
                  type="text"
                  value={editedRowData[key] !== undefined ? editedRowData[key] : row[key]}
                  onChange={(e) => handleInputChange(e, key)}
                  disabled={disableFields.includes(key)}
                  className={`border px-2 py-1 rounded w-1/2 ${
                    disableFields.includes(key) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                />
              ) : (
                <span>{row[key]}</span>
              )}
            </div>
          ))}
          
          <div className="flex space-x-2 mt-4">
            {rowIndex === editingRowIndex ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-[#00A305] text-white py-1 px-3 rounded flex-1 hover:bg-green-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white py-1 px-3 rounded flex-1 hover:bg-red-700 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(row, rowIndex)}
                  className="bg-[#00A305] text-white py-1 px-3 rounded flex-1 hover:bg-green-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="bg-white text-[#00A305] py-1 px-3 border-2 border-[#00A305] rounded flex-1 hover:bg-green-100 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  type="button"
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
  );

  return (
    <div className="mt-10">
      {renderDesktopTable()}
      {renderMobileCards()}
    </div>
  );
};

export default AuxMaintenanceTable;