import { notify } from '@/lib/notify';
import { ROUTES } from '@/app/routes';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const TOKEN_KEY = 'token';
const LOGIN_PATH = ROUTES.login;

/**
 * fetch con autenticación: agrega el token de sesión a cada petición al backend.
 * Si el servidor responde 401 a una petición autenticada (sesión vencida o inválida),
 * se limpia la sesión local y se envía al usuario al login.
 */
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userData');
    if (window.location.pathname !== LOGIN_PATH) window.location.assign(LOGIN_PATH);
  }

  if (response.status === 403) {
    // Se lee una copia para no consumir la respuesta que espera quien hizo la llamada.
    const body = await response.clone().json().catch(() => null);
    if (body?.demo) notify(body.error, 'demo');
  }

  return response;
};

export default API_URL;
