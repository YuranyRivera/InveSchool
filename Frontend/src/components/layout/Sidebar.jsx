import { Link, useLocation } from 'react-router-dom';
import { BookUser, ClipboardList, LayoutDashboard, LogOut, Package, ShieldCheck, UserCog, X } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import Logo from '@/components/brand/Logo';
import API_URL, { apiFetch } from '@/lib/apiClient';
import { RECORDS_BASE_PATH, ROUTES } from '@/app/routes';

// La demo puede ver Contactos y Seguridad (en solo lectura y con datos enmascarados por el servidor).
const ROLES_WITH_CONTACT_ACCESS = ['Administrador', 'Recursos Humanos', 'Demo'];
const ROLES_WITH_SECURITY_ACCESS = ['Administrador', 'Demo'];

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Tablero', icon: LayoutDashboard },
  { to: ROUTES.articles, label: 'Artículos', icon: Package },
  { to: ROUTES.users, label: 'Contactos', icon: BookUser, restricted: true },
  {
    to: ROUTES.movements,
    label: 'Registro',
    icon: ClipboardList,
    // Cualquier subsección de Registro (/records/...) marca este enlace como activo.
    activePrefix: RECORDS_BASE_PATH,
  },
  { to: ROUTES.profile, label: 'Mi perfil', icon: UserCog },
  { to: ROUTES.security, label: 'Seguridad', icon: ShieldCheck, adminOnly: true },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

const isActiveItem = (pathname, { to, activePrefix }) =>
  pathname === to || (activePrefix !== undefined && pathname.startsWith(`${activePrefix}/`));

const NavItem = ({ item, pathname, onNavigate }) => {
  const { to, label, icon: Icon } = item;
  const isActive = isActiveItem(pathname, item);

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-white/[0.08] text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg'
      }`}
    >
      <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-accent' : 'text-subtle group-hover:text-muted'} />
      {label}
    </Link>
  );
};

const Sidebar = ({ onClose, isMobile }) => {
  const { user, logoutUser } = useAuth();
  const { pathname } = useLocation();
  const hasContactAccess = ROLES_WITH_CONTACT_ACCESS.includes(user?.rol);
  const canSeeSecurity = ROLES_WITH_SECURITY_ACCESS.includes(user?.rol);
  const items = NAV_ITEMS.filter(
    (item) => (!item.restricted || hasContactAccess) && (!item.adminOnly || canSeeSecurity)
  );

  const handleLogout = async () => {
    try {
      // Avisa al servidor; si falla, igual se cierra la sesión localmente.
      await apiFetch(`${API_URL}/api/logout`, { method: 'POST' });
    } finally {
      logoutUser();
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-canvas">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo size={28} />
        {isMobile && (
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0 md:hidden" aria-label="Cerrar menú">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
        {items.map((item) => (
          <NavItem key={item.to} item={item} pathname={pathname} onNavigate={isMobile ? onClose : undefined} />
        ))}
      </nav>

      <div className="border-t border-line p-3">
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-navy text-xs font-semibold text-white">
              {getInitials(user.nombre) || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{user.nombre}</p>
              <p className="truncate text-xs text-subtle">{user.rol}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn-ghost mt-1 w-full justify-start px-3">
          <LogOut size={18} strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
