/** Reglas de validación compartidas. El servidor nunca confía en la validación del frontend. */

export const ROLES = Object.freeze(['Administrador', 'Recursos Humanos', 'Administrativo', 'Almacenamiento']);
export const USER_ADMIN_ROLES = Object.freeze(['Administrador', 'Recursos Humanos']);

// Rol de solo lectura para la demo pública del portafolio. No se puede asignar desde la API.
export const DEMO_ROLE = 'Demo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt solo usa los primeros 72 bytes; limitar evita contraseñas truncadas en silencio y abuso de CPU.
const MAX_PASSWORD_LENGTH = 72;

export const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

export const isValidEmail = (email) =>
  typeof email === 'string' && email.length <= MAX_EMAIL_LENGTH && EMAIL_REGEX.test(email);

/** Devuelve un mensaje de error o null si la contraseña cumple la política. */
export const passwordPolicyError = (password) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`;
  }
  if (/\s/.test(password)) return 'La contraseña no debe contener espacios.';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'La contraseña debe incluir mayúsculas, minúsculas y números.';
  }
  return null;
};

export const isPositiveInt = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

export const BCRYPT_ROUNDS = 12;

/** Oculta la mayor parte de un correo: "yurani@gmail.com" → "y•••••@gmail.com". */
export const maskEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) return email ?? null;
  const [local, domain] = email.split('@');
  return `${local[0]}${'•'.repeat(Math.max(local.length - 1, 3))}@${domain}`;
};

/** Oculta la parte final de una IP: "181.52.10.4" → "181.52.•.•". */
export const maskIp = (ip) => {
  if (typeof ip !== 'string') return ip ?? null;
  if (ip.includes('.')) return ip.split('.').map((part, i) => (i < 2 ? part : '•')).join('.');
  return ip.split(':').slice(0, 2).join(':') + ':•••';
};
