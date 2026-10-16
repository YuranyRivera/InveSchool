import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const VERIFY_OPTIONS = {
  algorithms: ['HS256'],
  issuer: config.jwt.issuer,
  audience: config.jwt.audience,
};

/** Exige un token de sesión válido en la cabecera Authorization: Bearer <token>. */
export const verifyToken = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret, VERIFY_OPTIONS);
    if (payload.typ !== 'access') throw new Error('Tipo de token inválido');

    req.user = { id: Number(payload.sub), rol: payload.rol, nombre: payload.nombre, correo: payload.correo };
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
};

/** Restringe una ruta a ciertos roles. Debe usarse después de verifyToken. */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    return next();
  };
