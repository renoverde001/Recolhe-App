
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    (res as any).status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    (req as any).user = verified as any;
    next();
  } catch (err) {
    (res as any).status(403).json({ error: 'Invalid token.' });
  }
};
