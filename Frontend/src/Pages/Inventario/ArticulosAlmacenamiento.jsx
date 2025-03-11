import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useArticulos, useArticuloSearch } from '../../hooks/useArticulosAlmacenamiento';
import AuxMaintenanceTable from '../../Components/AuxMaintenanceTable';
import ButtonGroup from '../../Components/PDFAlm';
import ExcelExportButton from '../../Components/Excel';
import ModalBaja from '../../Components/ModalBaja';
import BarcodeGenerator from "../../Components/BarcodeGenerator";
const ArticulosAlmacenamiento = () => {
  const headers = ['ID','Codigo',  'Producto/Detalle', 'Cantidad Inicial', 'Módulo', 'Estante', 'Estado', 'Entrada', 'Salida', 'Restante'];
  const { articulos, loading, error, fetchArticulos, updateArticulo, deleteArticulo } = useArticulos();
  const { searchTerm, setSearchTerm, filteredArticulos } = useArticuloSearch(articulos);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  const handleDeleteClick = (row) => {
    setSelectedArticulo(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (formData) => {
    try {
      if (selectedArticulo) {
        const success = await deleteArticulo(selectedArticulo.id, formData);
        if (success) {
          setIsModalOpen(false);
          navigate('/ArticulosBaja2');
        }
      }
    } catch (error) {
      console.error('Error en el proceso de baja:', error);
      alert('Error al procesar la baja del artículo');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (['id', 'cantidad'].includes(field)) return;

    setEditedRowData(prev => {
      const updatedData = { ...prev, [field]: value };

      if (['entrada', 'salida'].includes(field)) {
        const entrada = parseInt(updatedData.entrada || 0, 10);
        const salida = parseInt(updatedData.salida || 0, 10);
        const cantidadInicial = parseInt(prev.cantidad_productos || 0, 10);
        updatedData.cantidad = cantidadInicial + entrada - salida;
      }

      return updatedData;
    });
  };

  const handleEdit = (row, index) => {
    setEditingRowIndex(index);
    setEditedRowData({ ...row });
  };

  const handleSave = async () => {
    try {
      const success = await updateArticulo(editedRowData.id, editedRowData);
      if (success) {
        setEditingRowIndex(null);
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el artículo');
    }
  };

  const handleCancel = () => {
    setEditingRowIndex(null);
    setEditedRowData({});
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ModalBaja
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArticulo(null);
        }}
        onSave={handleDelete}
      />

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch space-y-2 md:space-y-0 md:space-x-2">
          <div className="relative flex-1 max-w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <ButtonGroup
              isStorageSelected={true}
              reloadArticulos={fetchArticulos}
              filteredData={searchTerm ? filteredArticulos : []}
              allData={articulos}
              className="flex-grow md:flex-grow-0"
            />
            <ExcelExportButton 
              filteredData={searchTerm ? filteredArticulos : []}
              allData={articulos}
              className="flex-grow md:flex-grow-0"
            />
          </div>

          <BarcodeGenerator articulos={articulos} />
        </div>

        <div className="overflow-x-auto">
          <AuxMaintenanceTable
            headers={headers}
            rows={filteredArticulos.map((articulo) => ({
              id: articulo.id,
              codigo: articulo.codigo,
              producto: articulo.producto,
              cantidad_productos: articulo.cantidad_productos,
              modulo: articulo.modulo,
              estante: articulo.estante,
              estado: articulo.estado,
              entrada: articulo.entrada,
              salida: articulo.salida,
              cantidad: articulo.cantidad,
            }))}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            editingRowIndex={editingRowIndex}
            editedRowData={editedRowData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            disableFields={['id', 'cantidad', 'cantidad_productos']}
          />
        </div>
      </div>
    </>
  );
};

export default ArticulosAlmacenamiento;