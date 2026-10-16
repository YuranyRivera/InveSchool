import { pool } from '../../config/database.js';
import { DEMO_ROLE, maskEmail, maskIp } from '../../utils/validation.js';

const MAX_LIMIT = 200;

/** Últimos eventos de la bitácora, más recientes primero. Filtro opcional: ?action=login_fail */
export const listAuditLog = async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 100, MAX_LIMIT);
    const action = typeof req.query.action === 'string' ? req.query.action.slice(0, 40) : null;

    const { rows } = await pool.query(
      `SELECT id, created_at, action, user_id, user_name, user_role, email, method, path, status, ip
         FROM audit_log
        WHERE ($1::varchar IS NULL OR action = $1)
        ORDER BY created_at DESC
        LIMIT $2`,
      [action, limit]
    );
    // La demo pública ve la actividad con correos e IP enmascarados.
    const events =
      req.user.rol === DEMO_ROLE ? rows.map((e) => ({ ...e, email: maskEmail(e.email), ip: maskIp(e.ip) })) : rows;
    return res.status(200).json(events);
  } catch (error) {
    return next(error);
  }
};
