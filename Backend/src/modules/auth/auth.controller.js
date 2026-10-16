import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database.js';
import { config } from '../../config/env.js';
import { isMailConfigured, sendMail } from '../../config/mailer.js';
import { passwordResetEmail } from './password-reset.email.js';
import { signAccessToken } from './token.service.js';
import { recordAudit } from '../audit/audit.service.js';
import { BCRYPT_ROUNDS, DEMO_ROLE, isValidEmail, normalizeEmail, passwordPolicyError } from '../../utils/validation.js';

const PUBLIC_USER_FIELDS = 'id, nombre, correo, rol';
const RESET_TOKEN_TTL = '30m';

// Hash de relleno: si el usuario no existe igual se ejecuta bcrypt, para que el tiempo
// de respuesta no revele qué correos están registrados.
const DUMMY_HASH = bcryptjs.hashSync('inveschool-dummy-password', BCRYPT_ROUNDS);

const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_USER_FIELDS}, "contraseña" AS password_hash FROM usuarios WHERE LOWER(correo) = $1 LIMIT 1`,
    [normalizeEmail(email)]
  );
  return rows[0] ?? null;
};

/**
 * El secreto del enlace de recuperación incluye el hash actual de la contraseña:
 * en cuanto la contraseña cambia, todos los enlaces anteriores dejan de servir (un solo uso).
 */
const resetSecretFor = (user) => `${config.jwt.secret}.${user.password_hash}`;

export const login = async (req, res, next) => {
  try {
    const { correo, contraseña: password } = req.body ?? {};
    if (!isValidEmail(normalizeEmail(correo)) || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const user = await findUserByEmail(correo);
    const passwordOk = await bcryptjs.compare(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !passwordOk) {
      recordAudit({ action: 'login_fail', email: normalizeEmail(correo), req, status: 401 });
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const publicUser = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    recordAudit({ action: 'login_ok', user: publicUser, email: user.correo, req, status: 200 });
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: publicUser,
      token: signAccessToken(publicUser),
    });
  } catch (error) {
    return next(error);
  }
};

/** Entrada a la demo pública: entrega una sesión de solo lectura sin contraseña. */
export const demoLogin = async (req, res, next) => {
  try {
    if (!config.demo.enabled) return res.status(404).json({ error: 'La demo no está disponible' });

    const user = await findUserByEmail(config.demo.email);
    if (!user || user.rol !== DEMO_ROLE) {
      console.error(`[demo] No existe un usuario con rol ${DEMO_ROLE} y correo ${config.demo.email}.`);
      return res.status(503).json({ error: 'La demo no está disponible en este momento' });
    }

    const publicUser = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    recordAudit({ action: 'demo_login', user: publicUser, req, status: 200 });
    return res.status(200).json({ user: publicUser, token: signAccessToken(publicUser) });
  } catch (error) {
    return next(error);
  }
};

// Las sesiones viven en el cliente (token Bearer); el servidor no guarda estado que limpiar.
export const logout = (req, res) => res.status(200).json({ message: 'Sesión cerrada' });

export const requestPasswordReset = async (req, res, next) => {
  // Siempre la misma respuesta: no se revela si el correo existe.
  const genericResponse = { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };

  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Ingresa un correo válido' });
    }

    const user = await findUserByEmail(email);

    // Se responde de inmediato y el correo se envía en segundo plano: la respuesta tarda lo mismo
    // exista o no la cuenta (no revela qué correos están registrados) y un proveedor lento no la bloquea.
    res.status(200).json(genericResponse);

    if (!user) return undefined;
    if (!isMailConfigured) {
      console.error('[mail] No hay proveedor de correo configurado (BREVO_API_KEY o MAIL_USER/MAIL_PASS).');
      return undefined;
    }

    const token = jwt.sign({ sub: String(user.id), typ: 'reset' }, resetSecretFor(user), {
      algorithm: 'HS256',
      expiresIn: RESET_TOKEN_TTL,
      issuer: config.jwt.issuer,
    });
    const resetLink = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.correo)}`;

    sendMail({ to: user.correo, ...passwordResetEmail(resetLink) }).catch((error) =>
      console.error('[mail] No se pudo enviar el correo de recuperación:', error.message)
    );
    return undefined;
  } catch (error) {
    // Si ya se respondió, el error solo se registra; si no, lo maneja el middleware de errores.
    if (res.headersSent) return console.error('[auth] Error en la recuperación de contraseña:', error);
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const invalidLink = { error: 'El enlace no es válido o ya expiró. Solicita uno nuevo.' };

  try {
    const { email, newPassword, token } = req.body ?? {};
    if (typeof token !== 'string' || !isValidEmail(normalizeEmail(email))) {
      return res.status(400).json(invalidLink);
    }

    const policyError = passwordPolicyError(newPassword);
    if (policyError) return res.status(400).json({ error: policyError });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json(invalidLink);

    try {
      const payload = jwt.verify(token, resetSecretFor(user), { algorithms: ['HS256'], issuer: config.jwt.issuer });
      if (payload.typ !== 'reset' || payload.sub !== String(user.id)) return res.status(400).json(invalidLink);
    } catch {
      return res.status(400).json(invalidLink);
    }

    const hash = await bcryptjs.hash(newPassword, BCRYPT_ROUNDS);
    await pool.query('UPDATE usuarios SET "contraseña" = $1 WHERE id = $2', [hash, user.id]);
    recordAudit({ action: 'password_reset', user, email: user.correo, req, status: 200 });

    return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, nombre, correo } = req.body ?? {};

    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ error: 'La contraseña actual es obligatoria' });
    }

    const { rows } = await pool.query('SELECT "contraseña" AS password_hash FROM usuarios WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!(await bcryptjs.compare(currentPassword, rows[0].password_hash))) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const updates = [];
    const values = [];
    const set = (column, value) => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if (nombre !== undefined && nombre !== null) {
      const trimmed = String(nombre).trim();
      if (trimmed.length < 2 || trimmed.length > 100) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres' });
      }
      set('nombre', trimmed);
    }

    if (correo !== undefined && correo !== null) {
      const email = normalizeEmail(correo);
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Correo inválido' });
      const taken = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(correo) = $1 AND id <> $2', [email, req.user.id]);
      if (taken.rowCount > 0) return res.status(409).json({ error: 'Ese correo ya está en uso' });
      set('correo', email);
    }

    if (newPassword) {
      const policyError = passwordPolicyError(newPassword);
      if (policyError) return res.status(400).json({ error: policyError });
      set('"contraseña"', await bcryptjs.hash(newPassword, BCRYPT_ROUNDS));
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No hay cambios para guardar' });

    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING ${PUBLIC_USER_FIELDS}`,
      values
    );

    return res.status(200).json({ message: 'Perfil actualizado exitosamente', user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
};
