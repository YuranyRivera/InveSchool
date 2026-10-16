/**
 * Única fuente de verdad para las URLs de la aplicación.
 * Ningún componente debe escribir rutas a mano: siempre ROUTES.<nombre>.
 */
export const ROUTES = Object.freeze({
  // Públicas
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  demo: '/demo',

  // Privadas
  dashboard: '/dashboard',
  articles: '/articles',
  users: '/users',
  profile: '/profile',
  security: '/security',

  // Registro (historial de operaciones)
  movements: '/records/movements',
  transfers: '/records/transfers',
  administrativeDisposals: '/records/administrative-disposals',
  storageDisposals: '/records/storage-disposals',
  suppliers: '/records/suppliers',
});

/** Prefijo común de las subsecciones de Registro. */
export const RECORDS_BASE_PATH = '/records';
