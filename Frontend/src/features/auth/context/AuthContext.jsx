import { createContext, useState, useEffect, useContext } from 'react';
import { ROUTES } from '@/app/routes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error al inicializar la autenticación:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
    localStorage.setItem('userData', JSON.stringify({ ...JSON.parse(localStorage.getItem('userData')), ...userData }));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = ROUTES.login;
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
