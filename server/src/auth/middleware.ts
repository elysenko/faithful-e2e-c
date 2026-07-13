import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt';
import { HttpError } from '../middleware/errors';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

/** Rejects requests without a valid Bearer JWT with 401. Attaches req.user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }
  try {
    const claims = verifyToken(token);
    req.user = { id: claims.sub, username: claims.username, role: claims.role };
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

/** Requires the authenticated user to hold the admin role (403 otherwise). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }
  if (req.user.role !== 'admin') {
    next(new HttpError(403, 'Administrator access required'));
    return;
  }
  next();
}
