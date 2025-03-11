import { useState, useEffect, useCallback } from 'react';

const useArticulosAdministrativos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerReload, setTriggerReload] = useState(0);

  const fetchArticulos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos-administrativos');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticulos(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticulos();
  }, [triggerReload, fetchArticulos]);

  const reloadArticulos = useCallback(() => {
    console.log('Reloading administrative articles...');
    setTriggerReload(prev => prev + 1);
  }, []);

  const agregarArticulo = async (articulo) => {
    setLoading(true);
    try {
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos-administrativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articulo),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el artículo');
      }

      const nuevoArticulo = await response.json();
      await fetchArticulos(); // Recargar los artículos después de agregar uno nuevo
      return nuevoArticulo;
    } catch (error) {
      console.error('Error en agregarArticulo:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { 
    articulos, 
    loading, 
    error, 
    reloadArticulos, 
    agregarArticulo 
  };
};

export default useArticulosAdministrativos;