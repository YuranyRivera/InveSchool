import React, { useState } from 'react';
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const AdminArticlesTable = ({
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
  const disabledFields = ['id', 'fecha_creacion'];

  const generateBarcodePDF = (codigo) => {
    const doc = new jsPDF();
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, codigo, { format: "CODE128" });
    const barcodeImage = canvas.toDataURL("image/png");

    doc.addImage(barcodeImage, "PNG", 10, 20, 50, 20);
    doc.save(`barcode_${codigo}.pdf`);
  };

  return (
    <>
      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full mt-10 table-auto rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-[#00A305] text-white">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-xs md:text-sm">
                  {header}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-xs md:text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`border-t bg-gray-100 hover:bg-gray-200 transition-colors`}
              >
                {index === editingRowIndex ? (
                  <>
                    {Object.entries(row).map(([key, value], idx) => {
                      const field = key.toLowerCase();
                      const isDisabled = disabledFields.includes(field);
                      return (
                        <td key={idx} className="px-2 py-1 md:px-4 md:py-2">
                          <input
                            type="text"
                            value={editedRowData[field] || ''}
                            onChange={(e) => handleInputChange(e, field)}
                            disabled={isDisabled}
                            className={`border px-1 py-1 rounded w-full text-xs md:text-sm ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 md:px-4 md:py-2 flex gap-2">
                      <button
                        onClick={handleSave}
                        className="bg-[#00A305] text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-save mr-1 md:mr-2"></i> Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-red-500 text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-red-700 transition-colors"
                      >
                        <i className="fas fa-times mr-1 md:mr-2"></i> Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {Object.values(row).map((cell, idx) => (
                      <td key={idx} className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                        {cell}
                      </td>
                    ))}
                    <td className="px-2 py-1 md:px-4 md:py-2 flex gap-2">
                      <button
                        onClick={() => onEdit(row, index)}
                        className="bg-[#00A305] text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-pencil-alt mr-1 md:mr-2"></i> Editar
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="bg-white text-[#00A305] py-1 px-2 md:px-3 border-2 border-[#00A305] rounded flex items-center text-xs md:text-sm hover:bg-green-100 transition-colors"
                      >
                        <i className="fas fa-trash-alt mr-1 md:mr-2"></i> Dar de baja
                      </button>
                      <button
                        onClick={() => generateBarcodePDF(row.codigo)}
                        className="bg-blue-500 text-white py-1 px-2 md:px-3 rounded flex items-center text-xs md:text-sm hover:bg-blue-700 transition-colors"
                      >
                        <i className="fas fa-barcode mr-1 md:mr-2"></i> Código
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para pantallas móviles */}
      <div className="block md:hidden space-y-4 mt-5">
        {rows.map((row, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-md bg-white">
            {index === editingRowIndex ? (
              Object.entries(row).map(([key, value]) => {
                const isDisabled = disabledFields.includes(key.toLowerCase());
                return (
                  <div key={key} className="mb-2">
                    <label className="block text-sm font-semibold capitalize">{key}:</label>
                    <input
                      type="text"
                      value={editedRowData[key] || ""}
                      onChange={(e) => handleInputChange(e, key)}
                      disabled={isDisabled}
                      className={`border px-2 py-1 rounded w-full ${
                        isDisabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                );
              })
            ) : (
              Object.entries(row).map(([key, value]) => (
                <p key={key} className="text-gray-700 text-sm">
                  <span className="font-semibold capitalize">{key}:</span> {value}
                </p>
              ))
            )}
            <div className="flex justify-between mt-3">
              {index === editingRowIndex ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-[#00A305] text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(row, index)}
                    className="bg-[#00A305] text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="bg-white text-[#00A305] py-1 px-3 border border-[#00A305] rounded text-sm hover:bg-green-100 transition"
                  >
                    Dar de baja
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
    </>
  );
};

export default AdminArticlesTable;