/**
 * Aplica el esquema y las migraciones SQL en orden.
 *
 * Uso:  npm run db:migrate
 *
 * Todos los archivos son idempotentes, así que se puede ejecutar varias veces sin riesgo.
 */
import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/database.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, 'migrations');

const files = [
  join(here, 'schema.sql'),
  ...readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => join(migrationsDir, name)),
];

try {
  for (const file of files) {
    await pool.query(readFileSync(file, 'utf8'));
    console.log(`✓ ${file.slice(here.length + 1)}`);
  }
  console.log('Base de datos actualizada.');
} catch (error) {
  console.error('Error al aplicar las migraciones:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
