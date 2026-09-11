import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

// Supabase (y la mayoría de los Postgres administrados) exigen SSL en
// conexiones externas; sin esto, cada consulta desde Render falla con un
// error de conexión que termina como un 500 genérico en cualquier endpoint.
const isLocalHost = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
});

export { pool };