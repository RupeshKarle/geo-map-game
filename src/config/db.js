import pkg from 'pg';
const { Pool } = pkg;
import { DATABASE_URL, NODE_ENV } from './env.js';

console.log('Database URL:', DATABASE_URL);

const pool = new Pool({
 connectionString: DATABASE_URL,
 ssl: NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;