import { useState, useEffect } from 'react';

const useArticulo = () => {
  const [articulos, setArticulos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [triggerReload, setTriggerReload] = useState(0);

  useEffect(() => {
    const fetchArticulos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://inventarioschool-v1.onrender.com/api/articulos');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticulos(data);
        
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticulos();
  }, [triggerReload]);

  const reloadArticulos = () => {
    setTriggerReload(prev => prev + 1);
  };

  return { articulos, error, reloadArticulos, isLoading };
};

export default useArticulo;