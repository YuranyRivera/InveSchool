import { DEMO_ROLE } from '../utils/validation.js';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** La sesión de demo es de solo lectura: cualquier intento de modificar datos se rechaza en el servidor. */
export const blockDemoWrites = (req, res, next) => {
  if (req.user?.rol === DEMO_ROLE && !READ_METHODS.has(req.method)) {
    return res.status(403).json({ error: 'Estás en la demo: es de solo lectura, los cambios están deshabilitados.', demo: true });
  }
  return next();
};
