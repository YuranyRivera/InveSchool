import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loader from '@/components/feedback/Loader';
import API_URL, { apiFetch } from '@/lib/apiClient';

const ACTIONS = {
  login_ok: { label: 'Inicio de sesión', className: 'bg-success/10 text-success' },
  login_fail: { label: 'Intento fallido', className: 'bg-danger/10 text-danger' },
  demo_login: { label: 'Visita a la demo', className: 'bg-white/[0.06] text-muted' },
  password_reset: { label: 'Contraseña restablecida', className: 'bg-warning/10 text-warning' },
  create: { label: 'Creación', className: 'bg-accent/10 text-accent' },
  update: { label: 'Modificación', className: 'bg-white/[0.06] text-fg' },
  delete: { label: 'Eliminación', className: 'bg-danger/10 text-danger' },
};

const FILTERS = [
  { value: '', label: 'Todo' },
  { value: 'login_fail', label: 'Intentos fallidos' },
  { value: 'delete', label: 'Eliminaciones' },
  { value: 'login_ok', label: 'Inicios de sesión' },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium' });

// Operaciones que el servidor rechazó por permisos (p. ej. un intento de cambio desde la demo).
const BLOCKED = { label: 'Bloqueado', className: 'bg-danger/10 text-danger' };
const isBlocked = (event) => event.status === 401 || event.status === 403;

const ActionBadge = ({ event }) => {
  const isWrite = ['create', 'update', 'delete'].includes(event.action);
  const meta = isWrite && isBlocked(event)
    ? { ...BLOCKED, label: `${ACTIONS[event.action].label} bloqueada` }
    : ACTIONS[event.action] ?? { label: event.action, className: 'bg-white/[0.06] text-muted' };
  return <span className={`badge whitespace-nowrap ${meta.className}`}>{meta.label}</span>;
};

const SecurityPage = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const query = filter ? `?action=${encodeURIComponent(filter)}` : '';
      const response = await apiFetch(`${API_URL}/api/auditoria${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'No se pudo cargar la bitácora');
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Intentos fallidos de las últimas 24 horas: señal temprana de un ataque.
  const recentFailures = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return events.filter((e) => e.action === 'login_fail' && new Date(e.created_at).getTime() >= since).length;
  }, [events]);

  return (
    <DashboardLayout>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Seguridad</h1>
          <p className="page-subtitle">Registro de accesos y cambios realizados en el sistema.</p>
        </div>
        <button type="button" onClick={loadEvents} className="btn-secondary" disabled={isLoading}>
          <RefreshCw size={16} className={`text-subtle ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </header>

      {!filter && !isLoading && !error && (
        <div
          className={`card mb-6 flex items-center gap-4 p-5 ${recentFailures > 0 ? 'border-danger/40' : ''}`}
        >
          {recentFailures > 0 ? (
            <ShieldAlert size={22} className="flex-shrink-0 text-danger" />
          ) : (
            <ShieldCheck size={22} className="flex-shrink-0 text-success" />
          )}
          <p className="text-sm text-fg">
            {recentFailures > 0
              ? `${recentFailures} intento(s) fallido(s) de inicio de sesión en las últimas 24 horas. Revisa los correos y las IP.`
              : 'Sin intentos fallidos de inicio de sesión en las últimas 24 horas.'}
          </p>
        </div>
      )}

      <div className="segmented mb-6" role="tablist" aria-label="Filtrar eventos">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value || 'all'}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={`segmented-item ${filter === value ? 'segmented-item-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <Loader />}

      {!isLoading && error && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="card px-6 py-12 text-center text-sm text-muted">No hay eventos registrados.</div>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="table-shell overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                {['Fecha', 'Evento', 'Usuario', 'Detalle', 'IP'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="table-row">
                  <td className="whitespace-nowrap px-4 py-3 text-muted tabular-nums">{formatDate(event.created_at)}</td>
                  <td className="px-4 py-3">
                    <ActionBadge event={event} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-fg">{event.user_name ?? '—'}</p>
                    <p className="text-xs text-subtle">{event.email ?? event.user_role ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {event.method} {event.path}
                    {event.status ? <span className="ml-2 text-subtle">({event.status})</span> : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-subtle">{event.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SecurityPage;
