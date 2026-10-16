import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import Loader from '@/components/feedback/Loader';
import { ROUTES } from '@/app/routes';

/**
 * Ruta contenedora: solo deja pasar a usuarios con sesión.
 * La autorización real la hace el backend en cada petición; esto evita mostrar pantallas vacías.
 */
const ProtectedRoute = () => {
  const { user, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) return <Loader fullScreen />;
  if (!user) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
