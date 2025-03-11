import React, { useState, useEffect } from "react";
import Select from "react-select";
import DashboardLayout from '../../Layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '@dotlottie/player-component';
const Example = () => {
  const [selectedOption, setSelectedOption] = useState('reporte');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    activos: 0,
    inactivos: 0,
    total: 0
  });
  
  const navigate = useNavigate();
  useEffect(() => {
    obtenerProveedores();
  }, []);
  useEffect(() => {
    if (selectedProveedor) {
      setProductos([]); // Limpiamos los productos antes de buscar nuevos
      buscarProductos();
    } else {
      setProductos([]); // Limpiamos los productos si no hay proveedor seleccionado
      setEstadisticas({ activos: 0, inactivos: 0, total: 0 });
    }
  }, [selectedProveedor]);
  async function obtenerProveedores() {
    setIsLoading(true);
    try {
      const response = await fetch("https://inventarioschool-v1.onrender.com/api/proveedores");
      const data = await response.json();
      
      // Aseguramos que cada proveedor tenga un value único
      const proveedoresFormateados = data.map(prov => ({
        value: prov.proveedor.trim(), // Eliminamos espacios en blanco
        label: prov.proveedor.trim()
      }));
      
      setProveedores(proveedoresFormateados);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      setIsLoading(false);
    }
  }
   async function buscarProductos() {
    if (!selectedProveedor?.value) return;
    
    try {
      const proveedorValue = encodeURIComponent(selectedProveedor.value.trim());
      
      const [productosRes, statsRes] = await Promise.all([
        fetch(`https://inventarioschool-v1.onrender.com/api/productosproveedor?proveedor=${proveedorValue}`),
        fetch(`https://inventarioschool-v1.onrender.com/api/estadisticas?proveedor=${proveedorValue}`)
      ]);

      if (!productosRes.ok || !statsRes.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const [dataProductos, dataStats] = await Promise.all([
        productosRes.json(),
        statsRes.json()
      ]);

      // Verificamos y limpiamos los datos antes de actualizar el estado
      const productosLimpios = dataProductos.filter(producto => 
        producto.proveedor.trim() === selectedProveedor.value.trim()
      );

      setProductos(productosLimpios);
      setEstadisticas(dataStats);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setProductos([]);
      setEstadisticas({ activos: 0, inactivos: 0, total: 0 });
    }
  }
  const handleOptionChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    const routes = {
      'traslados': '/moduloadmin',
      'bajas': '/articulosbaja',
      'bajas2': '/articulosbaja2',
      'general': '/registro'
    };
    if (routes[value]) {
      navigate(routes[value]);
    }
  };
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Proveedores', 14, 20);
    
    // Add provider info
    doc.setFontSize(12);
    doc.text(`Proveedor: ${selectedProveedor.label}`, 14, 30);
    
    // Add statistics
    doc.text('Estadísticas:', 14, 40);
    doc.text(`Activos: ${estadisticas.activos}`, 20, 50);
    doc.text(`Inactivos: ${estadisticas.inactivos}`, 20, 60);
    doc.text(`Total: ${estadisticas.total}`, 20, 70);
    
    // Add products table with matching colors
    const tableData = productos.map(prod => [
      prod.descripcion,
      prod.proveedor,
      prod.estado
    ]);
    
    doc.autoTable({
      startY: 80,
      head: [['Descripción', 'Proveedor', 'Estado']],
      body: tableData,
      headStyles: {
        fillColor: [0, 163, 5], // #00A305 in RGB
        textColor: [255, 255, 255],
        fontSize: 10, // Reduce the font size for the header
        fontStyle: 'bold',
        cellPadding: 3, // Reduce padding to make header more compact
      },
      bodyStyles: {
        fontSize: 9, // Reduce the font size for body text
        cellPadding: 3, // Reduce padding to make rows more compact
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Matching the bg-gray-50
      },
      styles: {
        cellPadding: 3, // General padding adjustment
      },
      columnStyles: {
        2: {
          cellCallback: function(cell, data) {
            if (data.raw[2] === "Activo") {
              cell.styles.textColor = [22, 163, 74]; // text-green-800
              cell.styles.fillColor = [220, 252, 231]; // bg-green-100
            } else {
              cell.styles.textColor = [185, 28, 28]; // text-red-800
              cell.styles.fillColor = [254, 226, 226]; // bg-red-100
            }
          }
        }
      }
    });
    
    doc.save(`reporte_${selectedProveedor.label}.pdf`);
  };
  return (
    <DashboardLayout>
    {isLoading ? (
      <div className="flex justify-center items-center h-screen">
        <dotlottie-player
          src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
          background="transparent"
          speed="1"
          style={{ width: '300px', height: '300px' }}
          loop
          autoplay
        />
      </div>
    ) : (
      <>
   <div className="mb-6 m-5">
        <h1 className="text-3xl font-bold text-center text-black mb-10">Reporte de Proveedores</h1>
        <div className="flex flex-wrap gap-2 md:gap-4 mt-4 mb-6 ">
            {['general', 'traslados', 'bajas', 'bajas2', 'reporte'].map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="navigation"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                  className="appearance-none h-5 w-5 border border-green-600 rounded-full 
                    checked:bg-[#00A305] checked:border-[#00A305] 
                    focus:outline-none transition duration-200 mr-2 cursor-pointer"
                />
                <span className="text-gray-700">
                  {option === 'general' && 'General'}
                  {option === 'traslados' && 'Traslados'}
                  {option === 'bajas' && 'Historial de bajas-Administración'}
                  {option === 'bajas2' && 'Historial de bajas-Almacenamiento'}
                  {option === 'reporte' && 'Reporte'}
                </span>
              </label>
            ))}
          </div>
        <div className="flex justify-between pt-2 pb-3 items-center">
        {selectedProveedor && productos.length > 0 && (
            <button
              onClick={generatePDF}
              className="bg-white text-green-600 py-2 px-4 border-2 border-green-600 rounded hover:text-white hover:bg-[#00A305]"
            >
         <i className="fas fa-file-pdf mr-2"></i>
              Generar PDF
            </button>
           )}
           
          </div>
        <label>Buscar Proveedores</label>
        <div className="mb-8">
          
          <Select
            options={proveedores}
            value={selectedProveedor}
            onChange={setSelectedProveedor}
            placeholder="Seleccionar proveedor..."
            className="w-full"
            styles={{
              control: (base) => ({
                ...base,
                padding: '2px',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              })
            }}
          />
        </div>
        {selectedProveedor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-700">Activos</h2>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {estadisticas.activos}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-700">Inactivos</h2>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {estadisticas.inactivos}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-700">Total</h2>
                <p className="text-3xl font-bold text-yellow-300 mt-2">
                  {estadisticas.total}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {productos.length > 0 ? (
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto rounded-lg overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-[#00A305] text-white">
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, idx) => (
                  <tr 
                    key={producto.descripcion} 
                    className={`
                      border-b last:border-b-0
                      ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      hover:bg-gray-100 transition-colors
                    `}
                  >
                    <td className="px-4 py-3">{producto.descripcion}</td>
                    <td className="px-4 py-3">{producto.proveedor}</td>
                    <td className="px-4 py-3">
                      <span className={`
                        px-3 py-1 rounded-full text-sm
                        ${producto.estado === "Activo" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"}
                      `}>
                        {producto.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedProveedor ? (
          <div className="text-center py-8 text-gray-500">
            No hay productos para este proveedor.
          </div>
        ) : null}
      </div>
      {productos.length > 0 ? (
  <>
   
    {/* Vista en tarjetas para pantallas pequeñas */}
    <div className="block md:hidden">
      {productos.map((producto, index) => (
        <div
          key={producto.descripcion}
          className="border rounded-lg shadow-md p-4 mb-4 bg-gray-100"
        >
          <div className="flex justify-between mb-2">
            <span className="font-bold">Descripción:</span>
            <span>{producto.descripcion}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-bold">Proveedor:</span>
            <span>{producto.proveedor}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-bold">Estado:</span>
            <span className={`
              px-3 py-1 rounded-full text-sm
              ${producto.estado === "Activo"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"}
            `}>
              {producto.estado}
            </span>
          </div>
        
        </div>
      ))}
    </div>
  </>
) : selectedProveedor ? (
  <div className="text-center py-8 text-gray-500">
    No hay productos para este proveedor.
  </div>
) : null}
</>
)}
    </DashboardLayout>
  );
};
export default Example;