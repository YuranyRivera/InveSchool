import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar el token y la información del usuario al cargar
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        setIsLoading(false);
        return;
      }

      try {
        // Aquí podrías hacer una validación del token con el backend si lo deseas
        setIsLoading(false);
      } catch (error) {
        console.error('Error validando autenticación:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>; // O tu componente de loading
  }

  if (!user) {
    return <Navigate to="/Inicio" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;