import { pool } from '../../config/database.js';

const DB_TIMEOUT_MS = 5_000;

/** El proceso está vivo (no toca la base de datos). */
export const checkLiveness = (req, res) => res.status(200).json({ status: 'ok' });

/**
 * Crea el chequeo de la base de datos. Recibe la función de consulta para poder probarlo sin una BD real.
 * Además de verificar la conexión, esta consulta periódica mantiene activo el proyecto gratuito de Supabase.
 */
export const createDatabaseCheck = (query) => async (req, res) => {
  const startedAt = Date.now();
  try {
    await Promise.race([
      query('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), DB_TIMEOUT_MS)),
    ]);
    return res.status(200).json({ status: 'ok', database: 'ok', latencyMs: Date.now() - startedAt });
  } catch (error) {
    console.error('[health] La base de datos no responde:', error.message);
    // 503 = servicio no disponible: el monitor de disponibilidad lo detecta y avisa.
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
};

export const checkDatabase = createDatabaseCheck((sql) => pool.query(sql));
