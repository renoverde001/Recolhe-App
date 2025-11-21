import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createPickup = async (req: AuthRequest, res: Response) => {
  const { items = [], scheduledAt, location, notes } = (req as any).body;
  const userId = req.user?.id;

  if (!userId) return (res as any).status(401).json({ error: 'Unauthorized' });

  try {
    const result = await pool.query(
      'INSERT INTO pickups (user_id, items, scheduled_at, location, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, JSON.stringify(items), scheduledAt, location, notes]
    );
    (res as any).status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    (res as any).status(500).json({ error: 'Failed to create pickup' });
  }
};

export const getPickups = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) return (res as any).status(401).json({ error: 'Unauthorized' });

  try {
    let query = 'SELECT * FROM pickups ORDER BY scheduled_at DESC';
    let params: any[] = [];

    if (role !== 'collector') {
      query = 'SELECT * FROM pickups WHERE user_id = $1 ORDER BY scheduled_at DESC';
      params = [userId];
    }

    const result = await pool.query(query, params);
    (res as any).json(result.rows);
  } catch (err) {
    console.error(err);
    (res as any).status(500).json({ error: 'Failed to fetch pickups' });
  }
};
