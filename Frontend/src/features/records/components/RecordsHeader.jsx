import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/app/routes';

/** Subsecciones de "Registro". Cada una es una ruta propia. */
const REGISTRO_TABS = [
  { to: ROUTES.movements, label: 'Movimientos' },
  { to: ROUTES.transfers, label: 'Traslados' },
  { to: ROUTES.administrativeDisposals, label: 'Bajas administrativas' },
  { to: ROUTES.storageDisposals, label: 'Bajas de almacén' },
  { to: ROUTES.suppliers, label: 'Proveedores' },
];

const tabClass = ({ isActive }) =>
  `whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
    isActive ? 'border-fg text-fg' : 'border-transparent text-muted hover:text-fg'
  }`;

/** Encabezado común de las páginas de Registro: título, descripción y pestañas. */
const RecordsHeader = ({ title, description }) => (
  <header className="mb-8">
    <h1 className="page-title">{title}</h1>
    {description && <p className="page-subtitle">{description}</p>}
    <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-line" aria-label="Secciones de registro">
      {REGISTRO_TABS.map(({ to, label }) => (
        <NavLink key={to} to={to} className={tabClass}>
          {label}
        </NavLink>
      ))}
    </nav>
  </header>
);

export default RecordsHeader;
