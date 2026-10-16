import { useState, useEffect } from 'react';
import RecordsHeader from '@/features/records/components/RecordsHeader';
import Select from "react-select";
import selectStyles from '@/theme/selectStyles';
import DashboardLayout from '@/components/layout/DashboardLayout';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import API_URL, { apiFetch } from '@/lib/apiClient';
const SuppliersReportPage = () => {
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    activos: 0,
    inactivos: 0,
    total: 0
  });
  
  useEffect(() => {
    obtenerProveedores();
  }, []);
  // Solo debe recargarse cuando cambia el proveedor seleccionado.
  useEffect(() => {
    if (selectedProveedor) {
      setProductos([]); // Limpiamos los productos antes de buscar nuevos
      buscarProductos();
    } else {
      setProductos([]); // Limpiamos los productos si no hay proveedor seleccionado
      setEstadisticas({ activos: 0, inactivos: 0, total: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProveedor]);
  async function obtenerProveedores() {
    setIsLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/api/proveedores`);
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
        apiFetch(`${API_URL}/api/productosproveedor?proveedor=${proveedorValue}`),
        apiFetch(`${API_URL}/api/estadisticas?proveedor=${proveedorValue}`)
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
    
    autoTable(doc, {
      startY: 80,
      head: [['Descripción', 'Proveedor', 'Estado']],
      body: tableData,
      headStyles: {
        fillColor: [59, 130, 246], // #3B82F6 in RGB
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
        fillColor: [249, 250, 251], // Matching the bg-elevated
      },
      styles: {
        cellPadding: 3, // General padding adjustment
      },
      columnStyles: {
        2: {
          cellCallback: function(cell, data) {
            if (data.raw[2] === "Activo") {
              cell.styles.textColor = [22, 163, 74]; // text-success
              cell.styles.fillColor = [220, 252, 231]; // bg-success/10
            } else {
              cell.styles.textColor = [185, 28, 28]; // text-danger
              cell.styles.fillColor = [254, 226, 226]; // bg-danger/10
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
        <div className="w-12 h-12 border-4 border-line border-t-accent rounded-full animate-spin"></div>
      </div>
    ) : (
      <>
   <div>
        <RecordsHeader title="Proveedores" description="Estado de los artículos por proveedor." />
        <div className="flex justify-between pt-2 pb-3 items-center">
        {selectedProveedor && productos.length > 0 && (
            <button
              onClick={generatePDF}
              className="btn-secondary"
            >
         <i className="fas fa-file-pdf"></i>
              Generar PDF
            </button>
           )}
           
          </div>
        <label className="label">Proveedor</label>
        <div className="mb-8">
          
          <Select
            options={proveedores}
            value={selectedProveedor}
            onChange={setSelectedProveedor}
            placeholder="Seleccionar proveedor..."
            className="w-full"
            styles={selectStyles}
          />
        </div>
        {!selectedProveedor && (
          <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <p className="text-sm font-medium text-fg">Elige un proveedor</p>
            <p className="max-w-sm text-sm text-muted">
              Verás cuántos de sus artículos están activos o dados de baja, y podrás exportar el detalle en PDF.
            </p>
          </div>
        )}
        {selectedProveedor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-card">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-fg">Activos</h2>
                <p className="text-3xl font-bold text-accent mt-2">
                  {estadisticas.activos}
                </p>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-card">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-fg">Inactivos</h2>
                <p className="text-3xl font-bold text-danger mt-2">
                  {estadisticas.inactivos}
                </p>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-line shadow-card">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-fg">Total</h2>
                <p className="text-3xl font-bold text-warning mt-2">
                  {estadisticas.total}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {productos.length > 0 ? (
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto overflow-hidden rounded-xl bg-surface text-sm ring-1 ring-line">
              <thead>
                <tr className="table-head">
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
                      ${idx % 2 === 0 ? 'bg-elevated' : 'bg-surface'}
                      hover:bg-elevated transition-colors
                    `}
                  >
                    <td className="px-4 py-3">{producto.descripcion}</td>
                    <td className="px-4 py-3">{producto.proveedor}</td>
                    <td className="px-4 py-3">
                      <span className={`
                        px-3 py-1 rounded-full text-sm
                        ${producto.estado === "Activo" 
                          ? "bg-success/10 text-success" 
                          : "bg-danger/10 text-danger"}
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
          <div className="text-center py-8 text-muted">
            No hay productos para este proveedor.
          </div>
        ) : null}
      </div>
      {productos.length > 0 ? (
  <>
   
    {/* Vista en tarjetas para pantallas pequeñas */}
    <div className="block md:hidden">
      {productos.map((producto) => (
        <div
          key={producto.descripcion}
          className="border rounded-lg shadow-md p-4 mb-4 bg-elevated"
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
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"}
            `}>
              {producto.estado}
            </span>
          </div>
        
        </div>
      ))}
    </div>
  </>
) : selectedProveedor ? (
  <div className="text-center py-8 text-muted">
    No hay productos para este proveedor.
  </div>
) : null}
</>
)}
    </DashboardLayout>
  );
};
export default SuppliersReportPage;