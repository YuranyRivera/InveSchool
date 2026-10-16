import { recordAudit } from '../modules/audit/audit.service.js';

const ACTION_BY_METHOD = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };

/** Registra toda operación que modifica datos (POST, PUT, PATCH, DELETE), incluidos los intentos rechazados. */
export const auditWrites = (req, res, next) => {
  const action = ACTION_BY_METHOD[req.method];
  if (action) {
    res.on('finish', () => recordAudit({ action, user: req.user, req, status: res.statusCode }));
  }
  next();
};
