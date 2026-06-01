// JWT middleware. Verifies the Bearer token, hydrates req.user with a minimal
// principal { id, email }, and 401s on missing/invalid tokens.
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env.js';

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

interface JwtPayload {
  sub: string; // user id
  email: string;
}

export function signToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email } satisfies JwtPayload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
