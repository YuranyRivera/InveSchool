import React from 'react';

const Table = ({ title, headers, rows, onDelete }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-green-600 mb-4">{title}</h2>
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {/* Tabla para pantallas grandes */}
        <table className="min-w-full table-auto rounded-lg overflow-hidden shadow-lg hidden md:table">
          <thead>
            <tr className="bg-[#00A305] text-white">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left">{header}</th>
              ))}
              <th className="px-4 py-2 text-left">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{row.nombre}</td>
                  <td className="px-4 py-2">{row.correo}</td>
                  <td className="px-4 py-2">{row.rol}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-[#00A305] text-white py-1 px-3 rounded"
                      onClick={() => onDelete(row.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={headers.length + 1} className="px-4 py-2 text-center">No hay usuarios registrados</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Vista para pantallas pequeñas */}
        <div className="block md:hidden"> {/* Removido 'block' y dejado solo 'md:hidden' */}
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-4 shadow-sm bg-white"
              >
                <div className="mb-2">
                  <span className="font-bold">Nombre:</span> {row.nombre}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Correo:</span> {row.correo}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Rol:</span> {row.rol}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onDelete(row.id)}
                    className="bg-[#00A305] text-white py-1 px-3 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table;