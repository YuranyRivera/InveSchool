import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { ROUTES } from '@/app/routes';

/** Inicia una sesión de solo lectura en la demo pública y lleva al tablero. */
const useDemoLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  /** @param {string} [destination] Ruta interna a la que ir tras entrar (por defecto, el tablero). */
  const startDemo = useCallback(async (destination = ROUTES.dashboard) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiFetch(`${API_URL}/api/demo-login`, { method: 'POST' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'La demo no está disponible en este momento.');

      loginUser(data.user, data.token);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'No pudimos conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [loginUser, navigate]);

  return { startDemo, isLoading, error };
};

export default useDemoLogin;
