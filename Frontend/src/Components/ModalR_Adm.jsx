import React, { useState } from 'react';
import Select from 'react-select';
import BotonPrincipal from './Boton';
import BotonSecundario from './BotonSecundario';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacion from './ModalConfirmacion';

const ModalSalida = ({ isOpen, onClose }) => {
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

  const ubicaciones = [
    { value: "Recepción", label: "Recepción" },
    { value: "Tesorería", label: "Tesorería" },
    { value: "Coordinación convivencia", label: "Coordinación convivencia" },
    { value: "Rectoría", label: "Rectoría" },
    { value: "Secretaría académica", label: "Secretaría académica" },
    { value: "Coordinación académica", label: "Coordinación académica" },
    { value: "Sala de profesores", label: "Sala de profesores" },
    { value: "Aux contable y financiera", label: "Aux contable y financiera" },
    {
      value: "Aux administrativa y contable",
      label: "Aux administrativa y contable",
    },
    { value: "Contadora", label: "Contadora" },
    { value: "Cocina", label: "Cocina" },
    { value: "Almacén", label: "Almacén" },
    {
      value: "Espacio de servicios generales",
      label: "Espacio de servicios generales",
    },
    { value: "Sala audiovisuales", label: "Sala audiovisuales" },
    { value: "Sala lúdica", label: "Sala lúdica" },
    { value: "Capilla", label: "Capilla" },
        // Salones y sus competencias
        { value: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '102 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '103 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos', label: '104 - Pilosos-Curiosos-Comunicativos-Ciudadanos-Amorosos-Expresivos' },
        { value: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '105 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
        { value: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos', label: '106 - Curiosos-Pilosos-Ciudadanos-Comunicativos' },
        { value: '107 - Ciudadanos-Comunicativos', label: '107 - Ciudadanos-Comunicativos' },
        { value: '108 - Curiosos-Pilosos/Pilosos', label: '108 - Curiosos-Pilosos/Pilosos' },
        { value: '109 - Ciudadanos/Pensamiento Filosófico', label: '109 - Ciudadanos/Pensamiento Filosófico' },
        { value: '201 - Comunicativos', label: '201 - Comunicativos' },
        { value: '202 - Comunicativos', label: '202 - Comunicativos' },
        { value: '203 - Fraternos y Espirituales', label: '203 - Fraternos y Espirituales' },
        { value: '204 - Pensamiento Matemático', label: '204 - Pensamiento Matemático' },
        { value: '205 - Ciudadanos', label: '205 - Ciudadanos' },
        { value: '206 - Activos', label: '206 - Activos' },
        { value: '206 - Pensamiento Matemático', label: '206 - Pensamiento Matemático' },
        { value: '207 - Indagación Biológica/Indagación Química', label: '207 - Indagación Biológica/Indagación Química' },
        { value: '211 - Indagación Biológica/Indagación Química', label: '211 - Indagación Biológica/Indagación Química' },
        { value: '212 - Indagación Biológica/Indagación Química', label: '212 - Indagación Biológica/Indagación Química' },
        { value: '301 - Innovadores', label: '301 - Innovadores' },
        { value: '302 - Fraternos-Espirituales/Ciudadanos', label: '302 - Fraternos-Espirituales/Ciudadanos' },
        { value: '303 - Ciudadanos/Comunicativos', label: '303 - Ciudadanos/Comunicativos' },
        { value: '304 - Comunicativos', label: '304 - Comunicativos' },
        { value: '305 - Curiosos', label: '305 - Curiosos' },
        { value: '306 - Pilosos/Curiosos', label: '306 - Pilosos/Curiosos' },
        { value: '307 - Wac', label: '307 - Wac' },
        { value: '308 - Comunicativos/Semillero de Lectura', label: '308 - Comunicativos/Semillero de Lectura' },
        { value: '311 - Wac', label: '311 - Wac' },
        { value: '312 - Indagación Física', label: '312 - Indagación Física' },
        { value: '313 - Pensamiento Matemático/Indagación Física', label: '313 - Pensamiento Matemático/Indagación Física' },
        { value: '314 - Pensamiento Matemático/Indagación Física', label: '314 - Pensamiento Matemático/Indagación Física' },
        { value: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico', label: 'Sala 1 - 208 - Tecnología/Desarrollo Software/Diseño Gráfico' },
        { value: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico', label: 'Sala 2 - 209 - Desarrollo Software/Diseño Gráfico' },
        { value: 'Sala 3 - 210 - Tecnología/Diseño Gráfico', label: 'Sala 3 - 210 - Tecnología/Diseño Gráfico' },
        { value: 'Lab. Wac 309 - Wac', label: 'Lab. Wac 309 - Wac' }
   
    
  ];

  

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
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/productos/${ubicacionCodificada}`);
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

        const response = await fetch('https://inventarioschool-v1.onrender.com/api/traslados', {
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
        navigate('/ModuloAdmin');
      }, 2000);
    } catch (error) {
      setErrors({ ...errors, general: 'Error al guardar los traslados' });
    }
  };

  const ubicacionesDisponiblesFinal = ubicaciones.filter(ubicacion => 
    ubicacion.value !== ubicacionInicial
  );

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-lg sm:text-xl font-semibold">Registro de Traslados</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="text-xl">&times;</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">
              Ubicación inicial
            </label>
            <Select
              options={ubicaciones}
              onChange={handleUbicacionInicialChange}
              placeholder="Seleccionar ubicación inicial..."
              className={errors.ubicacionInicial ? 'border-red-500' : ''}
            />
            {errors.ubicacionInicial && (
              <p className="text-red-500 text-sm mt-1">{errors.ubicacionInicial}</p>
            )}
          </div>

          {ubicacionInicial && (
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Selecciona los productos
              </label>
              <Select
  isMulti
  options={productosDisponibles}
  value={selectedProducts}
  onChange={handleSelectProduct}
  placeholder="Seleccionar productos..."
  isClearable// Permite eliminar todas las opciones
  closeMenuOnSelect={false} // Mantiene el menú abierto para múltiples selecciones
  className={errors.productos ? 'border-red-500' : ''}
  filterOption={(option, inputValue) => {
    return (
      option.label.toLowerCase().includes(inputValue.toLowerCase()) || 
      option.data.codigo.toLowerCase().includes(inputValue.toLowerCase())
    );
  }}
/>


              {errors.productos && (
                <p className="text-red-500 text-sm mt-1">{errors.productos}</p>
              )}
            </div>
          )}

          {selectedProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-[#00A305] text-white">
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-medium">
                      Producto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
              <Select
                options={ubicacionesDisponiblesFinal}
                value={ubicacionFinal ? { value: ubicacionFinal, label: ubicacionFinal } : null}
                onChange={handleUbicacionFinalChange}
                placeholder="Seleccionar ubicación final..."
                className={errors.ubicacionFinal ? 'border-red-500' : ''}
              />
              {errors.ubicacionFinal && (
                <p className="text-red-500 text-sm mt-1">{errors.ubicacionFinal}</p>
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
                errors.solicitante ? 'border-red-500' : ''
              }`}
              placeholder="Nombre del solicitante"
            />
            {errors.solicitante && (
              <p className="text-red-500 text-sm mt-1">{errors.solicitante}</p>
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
                errors.fecha ? 'border-red-500' : ''
              }`}
            />
            {errors.fecha && (
              <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="p-4 mb-4">
            <p className="text-red-500 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t bg-gray-50">
        <BotonSecundario Text="Cancelar" onClick={onClose} />
          <BotonPrincipal Text="Guardar" onClick={handleSave} />
       
        </div>
      </div>

      <ModalConfirmacion
        isOpen={showConfirmation}
        message="Registro guardado con éxito"
        onClose={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default ModalSalida;