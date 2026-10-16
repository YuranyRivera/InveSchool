import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LogoMark } from '@/components/brand/Logo';
import useDemoLogin from '@/features/auth/hooks/useDemoLogin';
import { ROUTES } from '@/app/routes';

// Destinos permitidos para /demo?next=... (lista cerrada: evita redirecciones abiertas).
const ALLOWED_DESTINATIONS = [
  ROUTES.dashboard,
  ROUTES.articles,
  ROUTES.users,
  ROUTES.movements,
  ROUTES.transfers,
  ROUTES.administrativeDisposals,
  ROUTES.storageDisposals,
  ROUTES.suppliers,
  ROUTES.security,
];

/** Enlace directo para el portafolio: /demo entra a la demo sin pasar por el login. */
const DemoPage = () => {
  const { startDemo, error } = useDemoLogin();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('next');
  const destination = ALLOWED_DESTINATIONS.find((path) => path.toLowerCase() === requested?.toLowerCase()) ?? ROUTES.dashboard;
  const started = useRef(false);

  useEffect(() => {
    // Evita una doble llamada en desarrollo (React StrictMode monta los efectos dos veces).
    if (started.current) return;
    started.current = true;
    startDemo(destination);
  }, [startDemo, destination]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <LogoMark size={56} className="drop-shadow-[0_20px_40px_rgba(37,99,235,0.35)]" />
      {error ? (
        <>
          <p className="max-w-sm text-sm text-danger">{error}</p>
          <Link to={ROUTES.login} className="btn-secondary">
            Ir al inicio de sesión
          </Link>
        </>
      ) : (
        <>
          <div className="spinner" role="status" aria-label="Cargando" />
          <p className="text-sm text-muted">Preparando la demo…</p>
          <p className="text-xs text-subtle">El servidor gratuito puede tardar hasta un minuto en despertar.</p>
        </>
      )}
    </div>
  );
};

export default DemoPage;
