import React from 'react';

const Table = ({ title, headers, rows }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-green-600 mb-4">{title}</h2>
      
      {/* Tabla para pantallas medianas y grandes */}
      <div className="hidden md:block">
        <table className="min-w-full table-auto rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-[#00A305] text-white">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                {row.map((cell, idx) => (
                  <td key={idx} className="px-4 py-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Vista de tarjetas para dispositivos móviles */}
      <div className="md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            {headers.map((header, headerIndex) => (
              <div key={headerIndex} className="py-2 border-b last:border-b-0">
                <div className="font-medium text-gray-600">{header}</div>
                <div className="mt-1">{row[headerIndex]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;