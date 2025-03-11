import React, { useState, useEffect } from 'react';
import ProductSelect from './ProductSelect';
import EstadoSelect from './EstadoSelect';
import BotonPrincipal from './Boton';
import BotonSecundario from './BotonSecundario';
import useMovimientosAlmacen from '../hooks/useMovimientosAlmacen';
import ModalConfirmacion from './ModalConfirmacion';
import { useNavigate } from 'react-router-dom';

const ModalEntrada = ({ isOpen, onClose, reloadArticulos }) => {
  const {
    selectedProducts,
    responsable,
    estado,
    options,
    error,
    loading,
    handleSelectProduct,
    handleQuantityChange,
    handleSave,
    setResponsable,
    setEstado,
    resetForm,
  } = useMovimientosAlmacen(isOpen, onClose, reloadArticulos);

  const [errors, setErrors] = useState({
    responsable: '',
    productos: '',
    cantidad: '',
    estado: '',
  });

  const [isModalConfirmacionOpen, setIsModalConfirmacionOpen] = useState(false);
  const navigate = useNavigate();

  // Efecto para limpiar errores cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setErrors({
        responsable: '',
        productos: '',
        cantidad: '',
        estado: '',
      });
    }
  }, [isOpen]);

  const handleConfirmacionClose = () => {
    setErrors({
      responsable: '',
      productos: '',
      cantidad: '',
      estado: '',
    });
    setIsModalConfirmacionOpen(false);
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {
      responsable: '',
      productos: '',
      cantidad: '',
      estado: '',
    };
    let isValid = true;

// Validar responsable
if (!responsable || !responsable.trim()) {
  newErrors.responsable = 'El responsable es obligatorio.';
  isValid = false;
} else if (responsable.trim().length < 3) {
  newErrors.responsable = 'El nombre del responsable debe tener al menos 3 caracteres.';
  isValid = false;
} else if (responsable.trim().length > 50) {
  newErrors.responsable = 'El nombre del responsable no puede exceder 50 caracteres.';
  isValid = false;
} else if (/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/.test(responsable)) {  // Verificar que solo contenga letras y espacios
  newErrors.responsable = 'El nombre del responsable no debe contener números ni caracteres especiales.';
  isValid = false;
}
    // Validar estado (entrada/salida)
    if (!estado) {
      newErrors.estado = 'Debe seleccionar un tipo de movimiento (Entrada o Salida).';
      isValid = false;
    }

    // Validar productos
    if (!selectedProducts || selectedProducts.length === 0) {
      newErrors.productos = 'Debe seleccionar al menos un producto.';
      isValid = false;
    } else {
      // Validar cantidad de productos
      const invalidProducts = selectedProducts.filter(
        (product) => !product.quantity || product.quantity <= 0 || !Number.isInteger(Number(product.quantity))
      );

      if (invalidProducts.length > 0) {
        newErrors.cantidad = 'La cantidad debe ser un número entero mayor que 0.';
        isValid = false;
      }

      // Validar límites de cantidad
      const exceedingProducts = selectedProducts.filter(
        (product) => product.quantity > 99999
      );

      if (exceedingProducts.length > 0) {
        newErrors.cantidad = 'La cantidad no puede exceder 99,999 unidades.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGuardar = async () => {
    if (loading) return;

    if (!validateForm()) {
      return;
    }

    const saveSuccessful = await handleSave();
    if (saveSuccessful) {
      setIsModalConfirmacionOpen(true);
      setTimeout(() => {
        navigate('/Registro');
      }, 1000);
    }
  };

  // Limpiar errores al escribir o seleccionar
  const handleInputChange = (e, field) => {
    const value = e?.target?.value ?? e;
    
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }));

    if (field === 'responsable') {
      setResponsable(value);
    } else if (field === 'estado') {
      setEstado(value);
      // Limpiar error de estado específicamente
      setErrors(prev => ({ ...prev, estado: '' }));
    }
  };

  // Manejador específico para la selección de productos
  const handleProductSelection = (selectedOptions) => {
    handleSelectProduct(selectedOptions);
    setErrors(prev => ({ ...prev, productos: '', cantidad: '' }));
  };

  // Manejador específico para cambios de cantidad
  const handleQuantityUpdate = (value, productId) => {
    // Convert empty string to 0 or keep the numeric value
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    
    // Create a synthetic event object that mimics the structure expected by handleQuantityChange
    const syntheticEvent = {
      target: {
        value: numericValue
      }
    };
    
    handleQuantityChange(syntheticEvent, productId);
    setErrors(prev => ({ ...prev, cantidad: '' }));
  };
  if (!isOpen) return null;

  return (
    <div className="modal z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/2 max-h-[90vh] overflow-auto  max-[768px]:w-[80%]">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Registro de Almacenamiento</h3>
          <button 
            onClick={onClose} 
            className="text-xl hover:text-gray-700"
            disabled={loading}
          >
            X
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <EstadoSelect 
            currentStatus={estado} 
            onChange={(value) => handleInputChange(value, 'estado')}
            disabled={loading}
            filterOption={(option, inputValue) => {
              return (
                option.label.toLowerCase().includes(inputValue.toLowerCase()) || 
                option.data.codigo.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
          />
          {errors.estado && (
            <p className="text-red-500 text-sm mt-1">{errors.estado}</p>
          )}
        </div>

        <ProductSelect
          options={options}
          value={selectedProducts}
          onChange={handleProductSelection}
          isDisabled={loading}
        />
        {errors.productos && (
          <p className="text-red-500 text-sm mt-1 mb-2">{errors.productos}</p>
        )}

        {/* Producto y cantidad */}
        <div className="mb-4 overflow-y-auto max-h-[300px]">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#00A305] text-white">
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product) => (
                <tr key={product.value}>
                  <td className="px-4 py-2">{product.label}</td>
                  <td className="px-4 py-2">
                  <input
  type="number"
  min="0"
  max="99999"
  value={product.quantity || ''}
  onChange={(e) => handleQuantityUpdate(e.target.value, product.value)}
  onBlur={(e) => {
    if (e.target.value === '') {
      handleQuantityUpdate('0', product.value);
    }
  }}
  className={`border p-2 rounded w-full ${
    errors.cantidad ? 'border-red-500' : ''
  }`}
  disabled={loading}
  placeholder="Ingrese cantidad"
/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.cantidad && (
            <p className="text-red-500 text-sm mt-1">{errors.cantidad}</p>
          )}
        </div>

        {/* Campo Responsable */}
        <div className="mb-4">
  <label className="block text-lg mb-2">Responsable</label>
  <input
    type="text"
    value={responsable}
    onChange={(e) => handleInputChange(e, 'responsable')}
    className={`border p-2 w-full rounded ${
      errors.responsable ? 'border-red-500' : ''
    }`}
    placeholder="Nombre del responsable"
    disabled={loading}
    maxLength={50}
  />
  {errors.responsable && (
    <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>
  )}
</div>

        <div className="flex justify-end mt-4 space-x-4">
       
          <BotonSecundario 
            Text="Cancelar" 
            onClick={onClose}
            disabled={loading}
          />
             <BotonPrincipal 
            Text={loading ? "Guardando..." : "Guardar"} 
            onClick={handleGuardar}
            disabled={loading}
          />
        </div>
      </div>

      <ModalConfirmacion 
        isOpen={isModalConfirmacionOpen}
        onClose={handleConfirmacionClose}
        message="¡Registro guardado correctamente!"
      />
    </div>
  );
};

export default ModalEntrada;