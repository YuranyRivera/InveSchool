import { useState, useEffect } from 'react';
import { notify } from '@/lib/notify';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStorageArticleActions, useArticleSearch } from '@/features/inventory/hooks/useStorageArticleActions';
import StorageArticlesTable from '@/features/inventory/components/StorageArticlesTable';
import StorageArticlesPdfButton from '@/features/inventory/components/StorageArticlesPdfButton';
import ExcelExportButton from '@/components/export/ExcelExportButton';
import StorageDisposalModal from '@/features/inventory/components/StorageDisposalModal';
import BarcodePdfButton from "@/features/inventory/components/BarcodePdfButton";
import { ROUTES } from '@/app/routes';

const StorageArticlesSection = () => {
  const headers = ['ID', 'Código', 'Producto/Detalle', 'Cantidad inicial', 'Módulo', 'Estante', 'Estado', 'Entrada', 'Salida', 'Restante'];
  const { articulos, loading, error, fetchArticulos, updateArticulo, deleteArticulo } = useStorageArticleActions();
  const { searchTerm, setSearchTerm, filteredArticulos } = useArticleSearch(articulos);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const [tableData, setTableData] = useState([]);

  // Format the data for the table
  useEffect(() => {
    if (filteredArticulos.length > 0) {
      const formattedData = filteredArticulos.map(articulo => ({
        id: articulo.id,
        codigo: articulo.codigo,
        producto: articulo.producto,
        cantidad_productos: articulo.cantidad_productos,
        modulo: articulo.modulo,
        estante: articulo.estante,
        estado: articulo.estado,
        entrada: articulo.entrada,
        salida: articulo.salida,
        cantidad: articulo.cantidad
      }));
      setTableData((previous) =>
        JSON.stringify(previous) === JSON.stringify(formattedData) ? previous : formattedData
      );
    }
  }, [filteredArticulos]);

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
          navigate(ROUTES.storageDisposals);
        }
      }
    } catch (error) {
      console.error('Error en el proceso de baja:', error);
      notify('Error al procesar la baja del artículo', 'error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    
    setEditedRowData(prev => {
      const updatedData = { ...prev, [field]: value };

      // Calculate 'cantidad' when 'entrada' or 'salida' changes
      if (['entrada', 'salida'].includes(field)) {
        const entrada = parseInt(updatedData.entrada || 0, 10);
        const salida = parseInt(updatedData.salida || 0, 10);
        const cantidadInicial = parseInt(updatedData.cantidad_productos || 0, 10);
        updatedData.cantidad = cantidadInicial + entrada - salida;
      }

      return updatedData;
    });
  };

  const handleEdit = (row, index) => {
    // Make a clean copy of the row data to avoid reference issues
    const rowData = { ...row };
    setEditingRowIndex(index);
    setEditedRowData(rowData);
  };

  const handleSave = async () => {
    try {
      if (!editedRowData.id) {
        console.error('No ID found in edited data');
        notify('Error: No se puede actualizar sin ID', 'error');
        return;
      }

      const success = await updateArticulo(editedRowData.id, editedRowData);
      if (success) {
        setEditingRowIndex(null);
        setEditedRowData({});
        await fetchArticulos(); // Refresh data after successful update
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      notify('Error al actualizar el artículo', 'error');
    }
  };

  const handleCancel = () => {
    setEditingRowIndex(null);
    setEditedRowData({});
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <StorageDisposalModal
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
              <Search className="h-5 w-5 text-subtle" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <StorageArticlesPdfButton
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

          <BarcodePdfButton articulos={articulos} />
        </div>

        <div className="overflow-x-auto">
          <StorageArticlesTable
            headers={headers}
            rows={tableData}
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

export default StorageArticlesSection;