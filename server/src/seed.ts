import dotenv from 'dotenv';
import { migrate } from './migrate';
import { closePool } from './db';

dotenv.config();

/**
 * Standalone seed entry point (`npm run seed`). Idempotent: creates the schema
 * if missing and re-asserts the demo user, printing SEED_CRED to stdout.
 */
async function run(): Promise<void> {
  await migrate();
  await closePool();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', (err as Error).message);
    process.exit(1);
  });
