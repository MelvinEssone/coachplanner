import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { AuthRequest } from '../types';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Token manquant' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Token invalide ou expiré' });
  }
}
