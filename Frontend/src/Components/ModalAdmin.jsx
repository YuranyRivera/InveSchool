import React, { useState, useEffect } from 'react';
import CategorySelect from './CategorySelect';
import useArticulosAdministrativos from '../hooks/useArticulosAdministrativos';

const ModalAdmin = ({ isOpen, onClose, refreshArticulos }) => {
  if (!isOpen) return null;

  const headers = ['ID', 'Fecha', 'Descripción', 'Proveedor', 'Ubicación', 'Observación', 'Precio', 'Acciones'];
  const [rows, setRows] = useState([
    { id: null, fecha: '', descripcion: '', proveedor: '', ubicacion: '', observacion: '', precio: '' }
  ]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ total: 0, current: 0 });

  const { agregarArticulo } = useArticulosAdministrativos();

  const formatPrecioToNumber = (precio) => {
    if (!precio) return '';
    return precio.replace(/\$|\./g, '').trim();
  };

  const formatPrecioToCurrency = (precio) => {
    if (!precio) return '';
    const number = Number(precio.replace(/\D/g, ''));
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(number);
  };

  useEffect(() => {
    const fetchLastId = async () => {
      try {
        const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos-administrativos/last-id');
        const data = await response.json();
        const newId = data.id ? data.id + 1 : 1;
        setRows([{ id: newId, fecha: '', descripcion: '', proveedor: '', ubicacion: '', observacion: '', precio: '' }]);
      } catch (error) {
        console.error('Error al obtener el último ID:', error);
      }
    };

    if (isOpen) {
      fetchLastId();
      setErrors([]);
      setSaveStatus({ total: 0, current: 0 });
    }
  }, [isOpen]);

  const validateRow = (row) => {
    const rowErrors = {};
    if (!row.fecha) rowErrors.fecha = 'La fecha es obligatoria';
    if (!row.precio) rowErrors.precio = 'El precio es obligatorio';
    if (!row.descripcion.trim()) rowErrors.descripcion = 'La descripción es obligatoria';
    if (!row.proveedor.trim()) rowErrors.proveedor = 'El proveedor es obligatorio';
    if (!row.ubicacion) rowErrors.ubicacion = 'La ubicación es obligatoria';
    if (row.observacion.trim() && row.observacion.length > 500) rowErrors.observacion = 'La observación no puede exceder 500 caracteres';
    return rowErrors;
  };

  const handleDeleteRow = (indexToDelete) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, index) => index !== indexToDelete);
      const updatedErrors = errors.filter((_, index) => index !== indexToDelete);
      setRows(updatedRows);
      setErrors(updatedErrors);
    }
  };

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    const newId = lastRow.id + 1;
    setRows([...rows, {
      id: newId,
      fecha: '',
      descripcion: '',
      proveedor: '',
      ubicacion: '',
      observacion: '',
      precio: ''
    }]);
    setErrors([...errors, {}]);
  };

  const handleRowChange = (value, rowIndex, field) => {
    let processedValue = value;

    if (field === 'precio') {
      processedValue = formatPrecioToCurrency(value);
    }

    const updatedRows = rows.map((row, index) =>
      index === rowIndex ? { ...row, [field]: processedValue } : row
    );
    setRows(updatedRows);

    const updatedErrors = [...errors];
    if (!value) {
      updatedErrors[rowIndex] = { ...updatedErrors[rowIndex], [field]: `${field} es obligatorio` };
    } else {
      const currentErrors = updatedErrors[rowIndex] || {};
      delete currentErrors[field];
      updatedErrors[rowIndex] = currentErrors;
    }
    setErrors(updatedErrors);
  };

  const handleSave = async () => {
    if (loading) return;

    const newErrors = rows.map(row => validateRow(row));
    setErrors(newErrors);

    if (newErrors.some(err => Object.keys(err).length > 0)) {
      return;
    }

    try {
      setLoading(true);
      setSaveStatus({ total: rows.length, current: 0 });

      const processedRows = rows.map(row => ({
        ...row,
        precio: Number(formatPrecioToNumber(row.precio))
      }));

      for (let i = 0; i < processedRows.length; i++) {
        await agregarArticulo(processedRows[i]);
        setSaveStatus(prev => ({ ...prev, current: i + 1 }));
      }

      if (typeof refreshArticulos === 'function') {
        await refreshArticulos();
      }

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Error al guardar artículos:', error);
      alert('Hubo un error al guardar los artículos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (type, value, onChange, placeholder, error, disabled = false) => (
    <div className="w-full">
      <input
        type={type === "number" ? "text" : type}
        value={value}
        onChange={onChange}
        className={`border px-2 py-1 w-full rounded text-sm lg:text-base ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        disabled={disabled || loading}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-6xl p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-h-[95vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center flex-1">
            Agregar Artículos Administrativos
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
            ✕
          </button>
        </div>

        <div className="sm:hidden">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-4 border p-3 rounded-lg shadow">
              <h3 className="font-bold mb-2">Artículo {rowIndex + 1}</h3>
              <div className="grid grid-cols-1 gap-2">
                {renderInput("date", row.fecha, (e) => handleRowChange(e.target.value, rowIndex, 'fecha'), "Fecha", errors[rowIndex]?.fecha)}
                {renderInput("text", row.descripcion, (e) => handleRowChange(e.target.value, rowIndex, 'descripcion'), "Descripción", errors[rowIndex]?.descripcion)}
                {renderInput("text", row.proveedor, (e) => handleRowChange(e.target.value, rowIndex, 'proveedor'), "Proveedor", errors[rowIndex]?.proveedor)}
                <CategorySelect
                  value={row.ubicacion}
                  onChange={(e) => handleRowChange(e.target.value, rowIndex, 'ubicacion')}
                  error={errors[rowIndex]?.ubicacion}
                  disabled={loading}
                />
                {renderInput("text", row.observacion, (e) => handleRowChange(e.target.value, rowIndex, 'observacion'), "Observación (opcional)", errors[rowIndex]?.observacion)}
                {renderInput("number", row.precio, (e) => handleRowChange(e.target.value, rowIndex, "precio"), "Precio", errors[rowIndex]?.precio)}
              </div>
              <div className="flex justify-end mt-2">
                {rows.length > 1 && (
                  <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleAddRow}
            className="bg-[#00A305] text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            disabled={loading}
          >
            Agregar Artículo
          </button>
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#00A305] text-white">
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-2 text-left text-sm lg:text-base">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  <td className="px-4 py-2">{row.id}</td>
                  <td className="px-4 py-2">
                    {renderInput("date", row.fecha, (e) => handleRowChange(e.target.value, rowIndex, 'fecha'), "", errors[rowIndex]?.fecha)}
                  </td>
                  <td className="px-4 py-2">
                    {renderInput("text", row.descripcion, (e) => handleRowChange(e.target.value, rowIndex, 'descripcion'), "Descripción", errors[rowIndex]?.descripcion)}
                  </td>
                  <td className="px-4 py-2">
                    {renderInput("text", row.proveedor, (e) => handleRowChange(e.target.value, rowIndex, 'proveedor'), "Proveedor", errors[rowIndex]?.proveedor)}
                  </td>
                  <td className="px-4 py-2">
                    <CategorySelect
                      value={row.ubicacion}
                      onChange={(e) => handleRowChange(e.target.value, rowIndex, 'ubicacion')}
                      error={errors[rowIndex]?.ubicacion}
                      disabled={loading}
                    />
                    {errors[rowIndex]?.ubicacion && <p className="text-red-500 text-xs mt-1">{errors[rowIndex].ubicacion}</p>}
                  </td>
                  <td className="px-4 py-2">
                    {renderInput("text", row.observacion, (e) => handleRowChange(e.target.value, rowIndex, 'observacion'), "Observación (opcional)", errors[rowIndex]?.observacion)}
                  </td>
                  <td className="px-4 py-2">
                    {renderInput("number", row.precio, (e) => handleRowChange(e.target.value, rowIndex, "precio"), "Precio", errors[rowIndex]?.precio)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {rows.length > 1 && rowIndex !== rows.length - 1 ? (
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-sm lg:text-base"
                        disabled={loading}
                      >
                  <i className="fas fa-trash mr-1"></i> Eliminar
                      </button>
                    ) : rowIndex === rows.length - 1 ? (
                      <button
                        onClick={handleAddRow}
                        className="bg-[#00A305] text-white px-3 py-1 rounded hover:bg-green-700 text-sm lg:text-base"
                        disabled={loading}
                      >
                         <i className="fas fa-plus mr-1"></i> Agregar 
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onClose}
            className="bg-white hover:bg-[#00A305] text-green-600 border-2 border-green-600 hover:text-white transition duration-300 rounded-[8px] px-3 py-2 text-sm sm:px-4"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-[#00A305] text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAdmin;
