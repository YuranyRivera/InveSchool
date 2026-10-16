import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

/** Firma un token de sesión. Solo incluye lo necesario para autorizar. */
export const signAccessToken = (user) =>
  jwt.sign(
    { sub: String(user.id), rol: user.rol, nombre: user.nombre, correo: user.correo, typ: 'access' },
    config.jwt.secret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  );
