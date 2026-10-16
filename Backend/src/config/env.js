import 'dotenv/config';

/**
 * Configuración central del backend. Se valida al arrancar: si falta un secreto
 * o es débil, el servidor no inicia (es preferible fallar a quedar inseguro).
 */
const isProduction = process.env.NODE_ENV === 'production';
const MIN_SECRET_LENGTH = 32;

const fail = (message) => {
  throw new Error(`[config] ${message}`);
};

const jwtSecret = process.env.JWT_SECRET ?? '';
if (jwtSecret.length < MIN_SECRET_LENGTH) {
  fail(`JWT_SECRET debe tener al menos ${MIN_SECRET_LENGTH} caracteres.`);
}

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  fail('Define DATABASE_URL (o las variables DB_*) para conectar la base de datos.');
}

const parseList = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

if (isProduction && parseList(process.env.CORS_ORIGINS).length === 0) {
  fail('En producción define CORS_ORIGINS con la URL del frontend (ej. https://mi-app.vercel.app).');
}

export const config = Object.freeze({
  isProduction,
  port: Number(process.env.PORT) || 4000,
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
    issuer: 'inveschool-api',
    audience: 'inveschool-web',
  },
  // Orígenes exactos que pueden llamar a la API (sin comodines).
  corsOrigins: [...parseList(process.env.CORS_ORIGINS), ...(isProduction ? [] : DEV_ORIGINS)],
  // URL pública del frontend, usada en los enlaces de los correos.
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  // Demo pública de solo lectura para el portafolio (DEMO_ENABLED=true para activarla).
  demo: {
    enabled: process.env.DEMO_ENABLED === 'true',
    email: (process.env.DEMO_EMAIL || 'demo@inveschool.app').toLowerCase(),
  },
  mail: {
    // Acepta también los nombres usados antes en Render (GMAIL_USER / GMAIL_APP_PASSWORD).
    user: process.env.MAIL_USER || process.env.GMAIL_USER,
    pass: process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD,
  },
});
