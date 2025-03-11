import { useState, useEffect, useCallback } from 'react';

// Custom hook for fetching and managing articles
export const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticulos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticulos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]);

  const updateArticulo = async (id, updatedData) => {
    try {
      const response = await fetch(`https://inventarioschool-v1.onrender.com/api/articulos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Error updating article');
      }

      await fetchArticulos();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteArticulo = async (id, formData) => {
    try {
      // Paso 1: Crear el reporte de baja
      const bajaResponse = await fetch(`https://inventarioschool-v1.onrender.com/api/articulos-baja/${id}`, {
        method: 'POST',
        body: formData
      });

      if (!bajaResponse.ok) {
        throw new Error('Error al generar el reporte de baja');
      }

      // Paso 2: Eliminar el artículo
      const deleteResponse = await fetch(`https://inventarioschool-v1.onrender.com/api/articulos/${id}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error('Error al eliminar el artículo');
      }

      await fetchArticulos();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    articulos,
    loading,
    error,
    fetchArticulos,
    updateArticulo,
    deleteArticulo
  };
};

// Custom hook for search and filtering
export const useArticuloSearch = (articulos) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticulos = articulos.filter(articulo =>
    articulo.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    articulo.estante.toLowerCase().includes(searchTerm.toLowerCase())||
    articulo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    filteredArticulos
  };
};