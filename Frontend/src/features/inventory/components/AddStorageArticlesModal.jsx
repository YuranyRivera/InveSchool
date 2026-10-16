import { useState, useEffect } from 'react';
import useCreateStorageArticles from '@/features/inventory/hooks/useCreateStorageArticles';
import API_URL, { apiFetch } from '@/lib/apiClient';

const AddStorageArticlesModal = ({ isOpen, onClose, onSave }) => {

  const { addArticulos, loading } = useCreateStorageArticles(onSave);

  const headers = ['ID', 'Producto/Detalle', 'Cantidad', 'Módulo', 'Estante', 'Estado', 'Acciones'];
  const [rows, setRows] = useState([
    { id: null, modulo: '', estante: '', cantidad: '', producto: '', estado: '' },
  ]);

  const [errors, setErrors] = useState([]);
  const [duplicateError, setDuplicateError] = useState(null);

  useEffect(() => {
    const fetchLastId = async () => {
      try {
        const response = await apiFetch(`${API_URL}/api/articulos/last-id`);
        const data = await response.json();
        setRows([{ id: data.id + 1, modulo: '', estante: '', cantidad: '', producto: '', estado: '' }]);
      } catch (error) {
        console.error('Error al obtener último ID:', error);
      }
    };

    if (isOpen) {
      fetchLastId();
      setErrors([]);
      setDuplicateError(null);
    }
  }, [isOpen]);

  const validateRow = (row) => {
    const rowErrors = {};

    if (!row.producto.trim()) {
      rowErrors.producto = 'El producto es obligatorio';
    } else if (row.producto.length < 3) {
      rowErrors.producto = 'El producto debe tener al menos 3 caracteres';
    } else if (row.producto.length > 100) {
      rowErrors.producto = 'El producto no puede exceder 100 caracteres';
    } 

    if (!row.cantidad) {
      rowErrors.cantidad = 'La cantidad es obligatoria';
    } else {
      const cantidadNum = Number(row.cantidad);
      if (isNaN(cantidadNum) || cantidadNum <= 0) {
        rowErrors.cantidad = 'La cantidad debe ser un número positivo';
      } else if (cantidadNum > 99999) {
        rowErrors.cantidad = 'La cantidad no puede exceder 99,999';
      } else if (!Number.isInteger(cantidadNum)) {
        rowErrors.cantidad = 'La cantidad debe ser un número entero';
      }
    }

    if (!row.modulo.trim()) {
      rowErrors.modulo = 'El módulo es obligatorio';
    } else if (!/^[A-Za-z0-9\s]+$/.test(row.modulo)) {
      rowErrors.modulo = 'El módulo solo puede contener letras y números';
    }

    if (!row.estante.trim()) {
      rowErrors.estante = 'El estante es obligatorio';
    } else if (!/^[A-Za-z0-9\s]+$/.test(row.estante)) {
      rowErrors.estante = 'El estante solo puede contener letras y números';
    }

    if (!row.estado.trim()) {
      rowErrors.estado = 'El estado es obligatorio';
    }

    return rowErrors;
  };

  const handleAddRow = () => {
    const lastId = rows[rows.length - 1]?.id || 1;
    setRows([...rows, { id: lastId + 1, modulo: '', estante: '', cantidad: '', producto: '', estado: '' }]);
    setErrors([...errors, {}]);
  };

  const handleRowChange = (e, rowIndex, field) => {
    const { value } = e.target;
    const updatedRows = rows.map((row, index) =>
      index === rowIndex ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  
    const updatedErrors = [...errors];
    if (updatedErrors[rowIndex]) {
      delete updatedErrors[rowIndex][field];
      setErrors(updatedErrors);
    }
  
    // Limpiar el error de duplicado cuando se cambie el producto
    if (field === 'producto') {
      setDuplicateError(null); // Limpia el error de duplicado cuando se cambia el nombre del producto
    }
  };
  const handleDeleteRow = (indexToDelete) => {
    // Prevent deleting the last row
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, index) => index !== indexToDelete);
      const updatedErrors = errors.filter((_, index) => index !== indexToDelete);
      
      setRows(updatedRows);
      setErrors(updatedErrors);
    }
  };
  
  const handleSave = async () => {
    const newErrors = rows.map((row, index) => validateRow(row, index));
    setErrors(newErrors);
    setDuplicateError(null); // Reset duplicate error at start of save

    if (newErrors.some(err => Object.keys(err).length > 0)) {
      return;
    }

    // Check for duplicates within the current rows being added
    const duplicateInCurrentRows = rows.some((row, index) => 
      rows.some((otherRow, otherIndex) => 
        index !== otherIndex && 
        row.modulo === otherRow.modulo && 
        row.estante === otherRow.estante && 
        row.producto === otherRow.producto
      )
    );

    if (duplicateInCurrentRows) {
      setDuplicateError('Existen productos duplicados en las filas actuales');
      return;
    }

    try {
      for (const row of rows) {
        const result = await addArticulos({
          id: row.id,
          modulo: row.modulo,
          estante: row.estante,
          producto: row.producto,
          cantidad: row.cantidad,
          estado: row.estado
        });

        if (!result.success) {
          setDuplicateError(result.error || `El producto "${row.producto}" ya existe en el módulo ${row.modulo}, estante ${row.estante}`);
          return;
        }
      }

      onSave(); // Ejecuta la función proporcionada para acciones posteriores al guardado.
    window.location.reload(); // Recarga la página después de guardar.
  } catch (error) {
    console.error('Error al guardar artículos:', error);
    setDuplicateError('Error al guardar el artículo');
  }
  };

  // Los hooks van siempre antes de cualquier return (reglas de los Hooks de React).
  if (!isOpen) return null;

  return (
    <div className="modal z-50 fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-surface w-full max-w-7xl p-3 sm:p-4 md:p-6 rounded-2xl max-h-[90vh] overflow-auto border border-line shadow-card">
        <h2 className="mb-6 text-lg font-semibold text-fg">Nuevo artículo de almacén</h2>

        {duplicateError && (
  <div className="mb-4 p-3 bg-danger/10 border border-danger text-danger rounded">
    {duplicateError}
  </div>
)}
  

        {/* Vista móvil: Cards */}
        <div className="md:hidden space-y-4">
          {rows.map((row, rowIndex) => (
            <div key={row.id} className="bg-surface p-4 rounded-2xl border border-line shadow-card">
              <div className="grid gap-3">
                <div className="font-semibold">ID: {row.id}</div>
                
                {[
                  { label: 'Producto/Detalle', field: 'producto', type: 'text' },
                  { label: 'Cantidad', field: 'cantidad', type: 'number' },
                  { label: 'Módulo', field: 'modulo', type: 'text' },
                  { label: 'Estante', field: 'estante', type: 'text' },
                  { label: 'Estado', field: 'estado', type: 'text' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-fg mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={row[field]}
                      onChange={(e) => handleRowChange(e, rowIndex, field)}
                      className={`border px-2 py-1 w-full rounded ${
                        errors[rowIndex]?.[field] ? 'border-danger' : ''
                      }`}
                      placeholder={label}
                    />
                    {errors[rowIndex]?.[field] && (
                      <p className="text-danger text-xs mt-1">{errors[rowIndex][field]}</p>
                    )}
                  </div>
                ))}

                {rowIndex === rows.length - 1 && (
                  <button
                    onClick={handleAddRow}
                    className="btn-secondary w-full"
                  >
                    <i className="fas fa-plus"></i> Agregar fila
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop: Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto rounded-lg shadow-lg">
            <thead>
              <tr className="table-head">
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2">{row.id}</td>
                  {[
                    { field: 'producto', type: 'text' },
                    { field: 'cantidad', type: 'number' },
                    { field: 'modulo', type: 'text' },
                    { field: 'estante', type: 'text' },
                    { field: 'estado', type: 'text' },
                  ].map(({ field, type }) => (
                    <td key={field} className="px-4 py-2">
                      <div>
                        <input
                          type={type}
                          value={row[field]}
                          onChange={(e) => handleRowChange(e, rowIndex, field)}
                          className={`border px-2 py-1 w-full rounded ${
                            errors[rowIndex]?.[field] ? 'border-danger' : ''
                          }`}
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        />
                        {errors[rowIndex]?.[field] && (
                          <p className="text-danger text-xs mt-1">{errors[rowIndex][field]}</p>
                        )}
                      </div>
                    </td>
                  ))}
                           <td className="px-4 py-2 text-center">
  {rows.length > 1 && rowIndex !== rows.length - 1 ? (
    <button 
      onClick={() => handleDeleteRow(rowIndex)} 
      className="btn-danger btn-sm" 
      disabled={loading}
    >
      <i className="fas fa-trash"></i> Eliminar
    </button>
  ) : rowIndex === rows.length - 1 ? (
    <button 
      onClick={handleAddRow} 
      className="btn-secondary btn-sm" 
      disabled={loading}
    >
      <i className="fas fa-plus"></i> Agregar fila
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
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStorageArticlesModal;