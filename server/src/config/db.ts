
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Robust SSL configuration for various environments
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isProduction 
    ? { rejectUnauthorized: false } // Required for many cloud providers (Neon, Heroku, etc.)
    : false 
});

export default pool;
