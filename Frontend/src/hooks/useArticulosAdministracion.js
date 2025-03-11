import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_PRECIO = 9999999999;

const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const currencyToNumber = (value) => {
  if (!value && value !== 0) return 0;
  const cleanValue = value.toString().replace(/\./g, '').replace(',', '.');
  return Number(cleanValue);
};

const useArticulosAdministrativos = (articulos = [], reloadArticulos) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isObservacionModalOpen, setIsObservacionModalOpen] = useState(false);
  const [articuloToDelete, setArticuloToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleCancel = () => {
    setEditingRowIndex(null);
    setEditedRowData({});
    setErrors({});
  };

  const validateRow = (row) => {
    const newErrors = {};
    if (!row.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (!row.fecha?.trim()) {
      newErrors.fecha = 'La fecha es requerida';
    }
    const precio = currencyToNumber(row.precio);
    if (!precio || precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor que 0';
    }
    if (precio > MAX_PRECIO) {
      throw new Error('El precio excede el límite permitido');
    }
    return newErrors;
  };

  const filteredArticulos = articulos.filter(articulo => {
    const matchesSearch = 
      (articulo.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (articulo.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (articulo.ubicacion || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !selectedLocation || articulo.ubicacion === selectedLocation;
    
    if (!fromDate && !toDate) return matchesSearch && matchesLocation;
    
    const fechaArticuloStr = articulo.fecha ? articulo.fecha.split('T')[0] : '';
    const [year, month, day] = fechaArticuloStr.split('-').map(num => parseInt(num, 10));
    const fechaArticulo = new Date(Date.UTC(year, month - 1, day));
    
    let fechaInicio = null;
    let fechaFin = null;
    
    if (fromDate) {
      const [startYear, startMonth, startDay] = fromDate.split('-').map(num => parseInt(num, 10));
      fechaInicio = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    }
    
    if (toDate) {
      const [endYear, endMonth, endDay] = toDate.split('-').map(num => parseInt(num, 10));
      fechaFin = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
    }

    const cumpleFechaInicio = !fechaInicio || fechaArticulo >= fechaInicio;
    const cumpleFechaFin = !fechaFin || fechaArticulo <= fechaFin;
    
    return matchesSearch && matchesLocation && cumpleFechaInicio && cumpleFechaFin;
  });

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const tableRows = filteredArticulos.map(articulo => ({
    id: articulo.id,
    codigo: articulo.codigo || 'Nuevo Código',
    fecha: formatDateForDisplay(articulo.fecha),
    descripcion: articulo.descripcion || '',
    proveedor: articulo.proveedor || '',
    ubicacion: articulo.ubicacion || '',
    observacion: articulo.observacion || '',
    precio: formatCurrency(articulo.precio)
  }));

  const handleEdit = (row, index) => {
    const [day, month, year] = row.fecha.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    
    const precio = row.precio ? currencyToNumber(row.precio) : 0;
    
    setEditingRowIndex(index);
    setEditedRowData({
      ...row,
      fecha: formattedDate,
      precio: precio
    });
    setErrors({});
  };
  
  const handleInputChange = (e, field) => {
    if (field === 'id') return;
  
    let value = e.target.value;
  
    if (field === 'precio') {
      const numericValue = value.replace(/[^\d]/g, '');
      let numberValue = numericValue ? parseInt(numericValue, 10) : 0;
  
      if (numberValue > MAX_PRECIO) {
        return;
      }
  
      value = formatCurrency(numberValue);
    }
  
    setEditedRowData(prev => ({
      ...prev,
      [field]: value
    }));
  
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  const handleSave = async () => {
    const validationErrors = validateRow(editedRowData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const dataToSend = {
        ...editedRowData,
        precio: currencyToNumber(editedRowData.precio)
      };
  
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/articulos_administrativos/${editedRowData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el artículo');
      }
  
      await response.json();
      reloadArticulos();
      handleCancel();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(`Error al guardar los cambios: ${error.message}`);
    }
  };

  const handleDelete = async (observacion) => {
    if (!articuloToDelete?.id) {
      console.error('No hay ID de artículo para eliminar');
      return;
    }

    try {
      const url = `https://inventarioschool-v1.onrender.com/api/articulos_administrativos/${articuloToDelete.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ observacion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el artículo');
      }

      await response.json();
      reloadArticulos();
      setIsModalOpen(false);
      setArticuloToDelete(null);
      navigate('/ArticulosBaja');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(`Error al eliminar el artículo: ${error.message}`);
    }
  };

  const handleDeleteClick = (row) => {
    setArticuloToDelete(row);
    setIsObservacionModalOpen(true);
  };

  const handleObservacionSave = (observacion) => {
    setIsObservacionModalOpen(false);
    setIsModalOpen(true);
    setArticuloToDelete(prev => ({
      ...prev,
      observacion
    }));
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedLocation,
    setSelectedLocation,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    editingRowIndex,
    editedRowData,
    isModalOpen,
    isObservacionModalOpen,
    articuloToDelete,
    errors,
    handleCancel,
    handleEdit,
    handleInputChange,
    handleSave,
    handleDelete,
    handleDeleteClick,
    handleObservacionSave,
    tableRows,
    filteredArticulos,
  };
};

export default useArticulosAdministrativos;