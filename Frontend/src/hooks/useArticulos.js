import { useState } from 'react';

const useArticulos = (refreshArticulos) => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addArticulos = async (articuloData) => {
    setLoading(true);
    try {
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articuloData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Error al guardar el artículo'
        };
      }
  
      setArticulos((prevArticulos) => {
        const exists = prevArticulos.some(art => art.id === data.articulo.id);
        return exists ? prevArticulos : [...prevArticulos, data.articulo];
      });
  
      if (typeof refreshArticulos === 'function') {
        refreshArticulos();
      }
  
      return { success: true, data };
    } catch (error) {
      console.error('Add article error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al guardar el artículo'
      };
    } finally {
      setLoading(false);
    }
  };

  return { articulos, loading, error, addArticulos };
};

export default useArticulos;