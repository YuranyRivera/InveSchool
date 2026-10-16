import { pool } from '../../config/database.js';

/**
 * Registra un evento en la bitácora. Nunca bloquea ni rompe la petición:
 * si falla la escritura, solo se reporta en los logs del servidor.
 */
export const recordAudit = ({ action, user, email, req, status }) =>
  pool
    .query(
      `INSERT INTO audit_log (action, user_id, user_name, user_role, email, method, path, status, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        action,
        user?.id ?? null,
        user?.nombre?.slice(0, 100) ?? null,
        user?.rol ?? null,
        email?.slice(0, 254) ?? null,
        req.method,
        req.originalUrl.split('?')[0].slice(0, 300),
        status ?? null,
        req.ip?.slice(0, 64) ?? null,
      ]
    )
    .catch((error) => console.error('[audit] No se pudo registrar el evento:', error.message));
