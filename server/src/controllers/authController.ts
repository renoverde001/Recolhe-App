
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, language } = (req as any).body;

  // Basic Validation
  if (!name || !email || !password) {
      (res as any).status(400).json({ error: 'Please provide all fields' });
      return;
  }

  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (userExists.rows.length > 0) {
      (res as any).status(400).json({ error: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Use eco_coins (snake_case) for DB column
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, language, eco_coins) VALUES ($1, $2, $3, $4, $5, 0) RETURNING id, name, email, role, eco_coins, language',
      [name, normalizedEmail, hash, role || 'user', language || 'en']
    );

    const user = newUser.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    (res as any).status(201).json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        ecoCoins: user.eco_coins,
        language: user.language 
      }, 
      token 
    });
  } catch (err) {
    console.error('Registration Error:', err);
    (res as any).status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = (req as any).body;

  if (!email || !password) {
    (res as any).status(400).json({ error: 'Please provide email and password' });
    return;
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    
    if (result.rows.length === 0) {
      (res as any).status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      (res as any).status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    (res as any).json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        ecoCoins: user.eco_coins,
        language: user.language 
      }, 
      token 
    });
  } catch (err) {
    console.error('Login Error:', err);
    (res as any).status(500).json({ error: 'Server error during login' });
  }
};
