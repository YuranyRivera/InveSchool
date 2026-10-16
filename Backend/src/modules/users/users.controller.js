import bcryptjs from 'bcryptjs';
import { pool } from '../../config/database.js';
import { BCRYPT_ROUNDS, DEMO_ROLE, ROLES, isValidEmail, maskEmail, normalizeEmail, passwordPolicyError } from '../../utils/validation.js';

// Nunca se devuelve el hash de la contraseña.
const PUBLIC_USER_FIELDS = 'id, nombre, correo, rol';

export const listUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${PUBLIC_USER_FIELDS} FROM usuarios ORDER BY nombre ASC`);
    // La demo pública ve la lista, pero sin exponer correos reales.
    const users = req.user.rol === DEMO_ROLE ? rows.map((u) => ({ ...u, correo: maskEmail(u.correo) })) : rows;
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body ?? {};
    const nombre = typeof fullName === 'string' ? fullName.trim() : '';
    const correo = normalizeEmail(email);

    if (nombre.length < 2 || nombre.length > 100) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres' });
    }
    if (!isValidEmail(correo)) return res.status(400).json({ error: 'Correo inválido' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido' });

    // Solo un Administrador puede crear otro Administrador (evita escalar privilegios).
    if (role === 'Administrador' && req.user.rol !== 'Administrador') {
      return res.status(403).json({ error: 'Solo un Administrador puede crear administradores' });
    }

    const policyError = passwordPolicyError(password);
    if (policyError) return res.status(400).json({ error: policyError });

    const exists = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(correo) = $1', [correo]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });

    const hash = await bcryptjs.hash(password, BCRYPT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, correo, "contraseña", rol) VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_USER_FIELDS}`,
      [nombre, correo, hash, role]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const target = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
    if (target.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (target.rows[0].rol === 'Administrador' && req.user.rol !== 'Administrador') {
      return res.status(403).json({ error: 'Solo un Administrador puede eliminar administradores' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    return next(error);
  }
};
