import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

// Las BD en la nube (Render, Neon, Supabase, Railway...) exigen SSL.
// Pon DB_SSL=false solo si te conectas a una BD local.
const ssl = process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        ssl,
    });

export { pool };
