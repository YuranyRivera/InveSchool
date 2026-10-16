import { useState } from 'react';
import { LOCATIONS } from '@/constants/locations';
import Select from 'react-select';
import selectStyles from '@/theme/selectStyles';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { useNavigate } from 'react-router-dom';
import SuccessDialog from '@/components/feedback/SuccessDialog';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

const TransferModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [ubicacionInicial, setUbicacionInicial] = useState('');
  const [ubicacionFinal, setUbicacionFinal] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [solicitante, setSolicitante] = useState('');
  const [fecha, setFecha] = useState('');
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    ubicacionInicial: '',
    ubicacionFinal: '',
    productos: '',
    solicitante: '',
    fecha: ''
  });

  const ubicaciones = LOCATIONS;

  

  const handleUbicacionInicialChange = async (selectedOption) => {
    setErrors({ ...errors, ubicacionInicial: '' });
    setUbicacionInicial(selectedOption?.value || '');
    setUbicacionFinal('');
    setSelectedProducts([]);
    
    if (!selectedOption) {
      setErrors({ ...errors, ubicacionInicial: 'Debe seleccionar una ubicación inicial' });
      return;
    }
  
    try {
      // Codificar la ubicación para la URL
      const ubicacionCodificada = encodeURIComponent(selectedOption.value);
      const response = await apiFetch(`${API_URL}/api/productos/${ubicacionCodificada}`);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        setProductosDisponibles(data.map(producto => ({
          value: producto.id,
          label: `${producto.codigo} - ${producto.descripcion} `,
          codigo: producto.codigo,
          descripcion: producto.descripcion,
        })));
      } else {
        setProductosDisponibles([]);
        setErrors({ ...errors, productos: 'No hay productos disponibles en esta ubicación' });
      }
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      setErrors({ ...errors, productos: 'Error al cargar los productos' });
    }
  };


  

  const handleUbicacionFinalChange = (selectedOption) => {
    setErrors({ ...errors, ubicacionFinal: '' });
    if (!selectedOption) {
      setErrors({ ...errors, ubicacionFinal: 'Debe seleccionar una ubicación final' });
      return;
    }
    setUbicacionFinal(selectedOption.value);
  };

  const handleSelectProduct = (selectedOptions) => {
    setErrors({ ...errors, productos: '' });

     setSelectedProducts(selectedOptions || []);
    if (!selectedOptions || selectedOptions.length === 0) {
      setErrors({ ...errors, productos: 'Debe seleccionar al menos un producto' });
      return;
    }
    
    setSelectedProducts(selectedOptions);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!ubicacionInicial) newErrors.ubicacionInicial = 'La ubicación inicial es requerida';
    if (!ubicacionFinal) newErrors.ubicacionFinal = 'La ubicación final es requerida';
    if (!selectedProducts.length) newErrors.productos = 'Debe seleccionar al menos un producto';
    if (!solicitante.trim()) newErrors.solicitante = 'El solicitante es requerido';
    if (!fecha) newErrors.fecha = 'La fecha es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      for (const product of selectedProducts) {
        const trasladoData = {
          ubicacion_inicial: ubicacionInicial,
          id_articulo: product.value,
          ubicacion_final: ubicacionFinal,
          fecha: fecha,
          responsable: solicitante,
        };

        const response = await apiFetch(`${API_URL}/api/traslados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trasladoData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrors({ ...errors, general: errorData.error });
          return;
        }
      }

      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        navigate(ROUTES.transfers);
      }, 2000);
    } catch {
      setErrors({ ...errors, general: 'Error al guardar los traslados' });
    }
  };

  const ubicacionesDisponiblesFinal = ubicaciones.filter(ubicacion => 
    ubicacion.value !== ubicacionInicial
  );

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-2xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-auto border border-line shadow-card">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-lg font-semibold text-fg">Nuevo traslado</h3>
          <button onClick={onClose} className="text-muted hover:text-fg">
            <span className="text-xl">&times;</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">
              Ubicación inicial
            </label>
            <Select styles={selectStyles}
              options={ubicaciones}
              onChange={handleUbicacionInicialChange}
              placeholder="Seleccionar ubicación inicial..."
              className={errors.ubicacionInicial ? 'border-danger' : ''}
            />
            {errors.ubicacionInicial && (
              <p className="text-danger text-sm mt-1">{errors.ubicacionInicial}</p>
            )}
          </div>

          {ubicacionInicial && (
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Selecciona los productos
              </label>
              <Select styles={selectStyles}
  isMulti
  options={productosDisponibles}
  value={selectedProducts}
  onChange={handleSelectProduct}
  placeholder="Seleccionar productos..."
  isClearable// Permite eliminar todas las opciones
  closeMenuOnSelect={false} // Mantiene el menú abierto para múltiples selecciones
  className={errors.productos ? 'border-danger' : ''}
  filterOption={(option, inputValue) => {
    return (
      option.label.toLowerCase().includes(inputValue.toLowerCase()) || 
      option.data.codigo.toLowerCase().includes(inputValue.toLowerCase())
    );
  }}
/>


              {errors.productos && (
                <p className="text-danger text-sm mt-1">{errors.productos}</p>
              )}
            </div>
          )}

          {selectedProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <thead>
                  <tr className="table-head">
                    <th className="px-4 py-3 font-medium">
                      Producto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {selectedProducts.map((product) => (
                    <tr key={product.value}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                        {product.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ubicacionInicial && (
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Ubicación final
              </label>
              <Select styles={selectStyles}
                options={ubicacionesDisponiblesFinal}
                value={ubicacionFinal ? { value: ubicacionFinal, label: ubicacionFinal } : null}
                onChange={handleUbicacionFinalChange}
                placeholder="Seleccionar ubicación final..."
                className={errors.ubicacionFinal ? 'border-danger' : ''}
              />
              {errors.ubicacionFinal && (
                <p className="text-danger text-sm mt-1">{errors.ubicacionFinal}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">
              Solicitante
            </label>
            <input
              type="text"
              value={solicitante}
              onChange={(e) => {
                setSolicitante(e.target.value);
                setErrors({ ...errors, solicitante: '' });
              }}
              className={`border rounded w-full p-2 sm:p-3 text-sm sm:text-base ${
                errors.solicitante ? 'border-danger' : ''
              }`}
              placeholder="Nombre del solicitante"
            />
            {errors.solicitante && (
              <p className="text-danger text-sm mt-1">{errors.solicitante}</p>
            )}
          </div>

          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setErrors({ ...errors, fecha: '' });
              }}
              className={`border rounded w-full p-2 sm:p-3 text-sm sm:text-base ${
                errors.fecha ? 'border-danger' : ''
              }`}
            />
            {errors.fecha && (
              <p className="text-danger text-sm mt-1">{errors.fecha}</p>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="p-4 mb-4">
            <p className="text-danger text-sm">{errors.general}</p>
          </div>
        )}

        <div className="flex flex-col justify-end gap-2 border-t border-line p-4 sm:flex-row sm:p-6">
        <SecondaryButton Text="Cancelar" onClick={onClose} />
          <PrimaryButton Text="Guardar" onClick={handleSave} />
       
        </div>
      </div>

      <SuccessDialog
        isOpen={showConfirmation}
        message="Registro guardado con éxito"
        onClose={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default TransferModal;