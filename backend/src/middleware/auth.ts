import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthedRequest extends Request {
  user?: { email: string };
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret as string) as { email?: string };
    if (!payload.email) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    (req as AuthedRequest).user = { email: payload.email };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
