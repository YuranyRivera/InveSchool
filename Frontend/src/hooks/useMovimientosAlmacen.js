import { useState, useEffect } from 'react';

const useMovimientosAlmacen = (isOpen, onClose, reloadArticulos) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [responsable, setResponsable] = useState('');
  const [estado, setEstado] = useState(2);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProductos();
    }
  }, [isOpen]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/productos');
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error al obtener los productos', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const options = products.map((product) => ({
    value: product.id,
    label: `${product.producto} - ${product.codigo}` 
  }));

  const handleSelectProduct = (selectedOptions) => {
    // Asegurarse de que selectedOptions sea siempre un array
    const newSelectedProducts = selectedOptions ? 
      selectedOptions.map(product => ({
        ...product,
        quantity: product.quantity || 1
      })) : [];
    
    setSelectedProducts(newSelectedProducts);
  };

  const handleQuantityChange = (e, productId) => {
    const newQuantity = parseInt(e.target.value, 10) || 1;
    if (newQuantity < 1) return; // No permitir cantidades menores a 1

    setSelectedProducts((prevSelected) =>
      prevSelected.map((product) =>
        product.value === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  const validateData = () => {
    if (!responsable.trim()) {
      throw new Error('Debe ingresar el nombre del responsable');
    }
    
    if (selectedProducts.length === 0) {
      throw new Error('Debe seleccionar al menos un producto');
    }

    if (selectedProducts.some(p => !p.quantity || p.quantity < 1)) {
      throw new Error('Todas las cantidades deben ser mayores a 0');
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validar datos
      validateData();

      const storedCategory = localStorage.getItem('selectedCategory');
      if (!storedCategory) {
        throw new Error('No se encontró la categoría seleccionada');
      }

      const movimiento = {
        tipo_movimiento: estado,
        solicitante: responsable.trim(),
        id_productos: selectedProducts.map(p => p.value).join(','),
        cantidad_productos: selectedProducts.map(p => p.quantity).join(','),
        rol: storedCategory,
        nombre_productos: selectedProducts.map(p => p.label).join(',')
      };

      console.log('Enviando movimiento:', movimiento);

      const response = await fetch('https://inventarioschool-v1.onrender.com/api/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimiento),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar movimiento');
      }

      await reloadArticulos();
      return true;

    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      setError(error.message || 'Error al guardar el movimiento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setResponsable('');
    setEstado(2);
    setError(null);
  };

  return {
    selectedProducts,
    responsable,
    estado,
    products,
    options,
    error,
    loading,
    handleSelectProduct,
    handleQuantityChange,
    handleSave,
    setResponsable,
    setEstado,
    resetForm,
  };
};

export default useMovimientosAlmacen;