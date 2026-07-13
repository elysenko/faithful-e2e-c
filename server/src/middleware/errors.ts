import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DbUnavailableError } from '../db';

/** Generic HTTP error with an explicit status code. */
export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/** 404 for unmatched /api routes. */
export function apiNotFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError('Resource not found'));
}

function zodFields(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Central error handler: ZodError→400, DbUnavailable→503, HttpError→its status, else 500. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', fields: zodFields(err) });
    return;
  }
  if (err instanceof DbUnavailableError) {
    res.status(503).json({ error: 'Service Unavailable' });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[error] unhandled:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
