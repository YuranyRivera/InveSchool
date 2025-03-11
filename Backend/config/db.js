// Backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres.clewrkkgnqirnuxtftra",
    host: "aws-0-us-west-1.pooler.supabase.com",
    database: "postgres",
    password: "Solocosfa2024",
    port: 6543,
});

export { pool };