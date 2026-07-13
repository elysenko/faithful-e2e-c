import { Router } from 'express';
import { pingDb } from '../db';

export const healthRouter = Router();

// GET /api/health — liveness, always 200 while the process is up.
healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/health/deep — readiness, 503 when Postgres is unreachable.
healthRouter.get('/deep', async (_req, res) => {
  const dbUp = await pingDb();
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    database: dbUp ? 'up' : 'down',
  });
});
