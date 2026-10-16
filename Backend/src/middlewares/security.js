import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isPositiveInt } from '../utils/validation.js';

/** Cabeceras HTTP de seguridad. La API solo responde JSON, así que la CSP es la más estricta posible. */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

const limiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });

/** Límite general para toda la API. */
export const apiLimiter = limiter(15 * 60 * 1000, 600, 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.');

/** Protege el login contra fuerza bruta: solo cuenta los intentos fallidos. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.' },
});

/** Evita el envío masivo de correos de recuperación. */
export const passwordResetLimiter = limiter(60 * 60 * 1000, 5, 'Demasiadas solicitudes de recuperación. Intenta más tarde.');

/** Rechaza parámetros :id que no sean enteros positivos antes de llegar a la base de datos. */
export const validateIdParam = (req, res, next, value) =>
  isPositiveInt(value) ? next() : res.status(400).json({ error: 'Identificador inválido' });

/** Evita que se abuse del acceso a la demo pública. */
export const demoLoginLimiter = limiter(15 * 60 * 1000, 30, 'Demasiados accesos a la demo. Intenta en unos minutos.');
