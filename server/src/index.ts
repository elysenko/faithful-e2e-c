import './types';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import { migrate } from './migrate';
import { authRouter } from './routes/auth';
import { recipesRouter } from './routes/recipes';
import { healthRouter } from './routes/health';
import { adminRouter } from './routes/admin';
import { apiNotFound, errorHandler } from './middleware/errors';
import { closePool } from './db';

dotenv.config();

const PORT = Number(process.env.PORT ?? 8080);
const STATIC_DIR = process.env.STATIC_DIR ?? path.join(__dirname, '..', 'public');
const INDEX_HTML = path.join(STATIC_DIR, 'index.html');

export function createApp(): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  // --- API ---
  const api = express.Router();
  api.use('/health', healthRouter);
  api.use('/auth', authRouter);
  api.use('/recipes', recipesRouter);
  api.use('/admin', adminRouter);
  api.use(apiNotFound); // unknown /api/* → 404 JSON
  app.use('/api', api);

  // --- Static SPA (Angular build) + history fallback ---
  if (fs.existsSync(STATIC_DIR)) {
    app.use(express.static(STATIC_DIR));
  }
  app.get(/^\/(?!api\/).*/, (_req, res, next) => {
    if (fs.existsSync(INDEX_HTML)) {
      res.sendFile(INDEX_HTML);
    } else {
      next();
    }
  });

  app.use(errorHandler);
  return app;
}

async function bootstrap(): Promise<void> {
  // Self-heal the schema + demo user on boot. If the DB is down we log and keep
  // serving so liveness stays green and the app recovers once Postgres is up.
  try {
    await migrate();
    console.log('[boot] database migration + seed complete');
  } catch (err) {
    console.error('[boot] migration skipped (database unavailable):', (err as Error).message);
  }

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[boot] FaithfulC server listening on port ${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[shutdown] received ${signal}`);
    server.close(() => {
      void closePool().finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  void bootstrap();
}
