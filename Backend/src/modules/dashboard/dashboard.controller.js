import { pool } from '../../config/database.js';

// Controlador para obtener el último registro
export const listRecentActivity = async (req, res) => {
  try {
    // Últimos eventos para la "Actividad reciente" del tablero.
    const result = await pool.query(
      `SELECT id, tipo_tabla, fecha_registro AS fecha, descripcion, tabla_origen_id
         FROM ultimo_registro
        ORDER BY fecha_registro DESC, id DESC
        LIMIT 5`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error al obtener la actividad reciente:', err);
    res.status(500).json({ error: 'Error al obtener la actividad reciente' });
  }
};

export const countStorageArticles = async (req, res) => {
  try {
    // Consulta para contar el número total de registros en la tabla articulos_almacenamiento
    const result = await pool.query('SELECT COUNT(*) AS total_registros FROM articulos_almacenamiento');

    // Devuelve el total de registros encontrados
    res.status(200).json(result.rows[0]); // El total estará en result.rows[0].total_registros
  } catch (error) {
    console.error('Error al obtener el total de artículos en almacenamiento:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos en almacenamiento'
    });
  }
};

// Obtener el número total de artículos activos
export const countActiveAdministrativeArticles = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_activos FROM articulos_administrativos');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos activos
  } catch (error) {
    console.error('Error al obtener el total de artículos activos:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos activos'
    });
  }
};

// Obtener el número total de artículos inactivos
export const countAdministrativeDisposals = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_inactivos FROM articulos_baja');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos inactivos
  } catch (error) {
    console.error('Error al obtener el total de artículos inactivos:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos inactivos'
    });
  }
};

export const countStorageDisposals = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_historial FROM articulos_baja_historial');
    res.status(200).json(result.rows[0]); // Devuelve el total de artículos en el historial de bajas
  } catch (error) {
    console.error('Error al obtener el total de artículos en el historial de bajas:', error);
    res.status(500).json({
      message: 'Error al obtener el total de artículos en el historial de bajas'
    });
  }
};
