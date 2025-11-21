
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { register, login } from './controllers/authController';
import { createPickup, getPickups } from './controllers/pickupController';
import { chat } from './controllers/chatController';
import { authenticateToken } from './middleware/auth';
import pool from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable permissive CORS for development/demo
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json() as any);

// Request Logger
app.use((req: any, res: any, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/chat', chat);

// Protected Routes
app.post('/api/pickups', authenticateToken, createPickup);
app.get('/api/pickups', authenticateToken, getPickups);

// Health Check
app.get('/', async (req: any, res: any) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).send('Recolhe+ Backend is running. DB Connection: OK');
  } catch (err) {
    res.status(500).send('Recolhe+ Backend is running. DB Connection: FAILED');
  }
});

// Initialize Database Schema
const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    // Fallback schema if file reading fails or in weird environment
    const defaultSchema = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          eco_coins INTEGER DEFAULT 0,
          language TEXT DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS pickups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          status TEXT DEFAULT 'requested',
          items JSONB DEFAULT '[]',
          scheduled_at TIMESTAMP WITH TIME ZONE,
          location TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          amount INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    let schemaSql = defaultSchema;
    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
    }

    await pool.query(schemaSql);
    console.log('✅ Database schema applied successfully.');
  } catch (err) {
    console.error('⚠️ Failed to apply database schema:', err);
  }
};

// Database Connection Retry Logic
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL successfully');
      await initDatabase(); // Run migrations
      return;
    } catch (err) {
      console.error(`❌ Failed to connect to PostgreSQL (Attempt ${i + 1}/${retries}):`, (err as Error).message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  console.error('❌ Could not connect to Database after multiple attempts. The server may not function correctly.');
};

// Bind to 0.0.0.0 to ensure accessibility from outside containers/VMs
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/`);
  
  // Attempt to connect to DB
  connectWithRetry();
});
