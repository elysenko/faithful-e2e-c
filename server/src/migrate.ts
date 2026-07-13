import bcrypt from 'bcryptjs';
import { query } from './db';

const SCHEMA_STATEMENTS: string[] = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS users (
     id            serial PRIMARY KEY,
     username      text UNIQUE NOT NULL,
     password_hash text NOT NULL,
     role          text NOT NULL DEFAULT 'user',
     created_at    timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS recipes (
     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id     integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title       text NOT NULL,
     ingredients text NOT NULL,
     steps       text NOT NULL,
     favorite    boolean NOT NULL DEFAULT false,
     created_at  timestamptz NOT NULL DEFAULT now(),
     updated_at  timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes (user_id)`,
  `CREATE INDEX IF NOT EXISTS recipes_user_favorite_idx ON recipes (user_id, favorite)`,
  `CREATE INDEX IF NOT EXISTS recipes_user_lower_title_idx ON recipes (user_id, lower(title))`,
  `CREATE TABLE IF NOT EXISTS system_settings (
     key        text PRIMARY KEY,
     value      text NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
];

/**
 * Idempotently create the schema and seed the demo user. Safe to run on every
 * boot. Re-asserts the demo password on every run so the credential printed as
 * SEED_CRED always matches the stored hash.
 */
export async function migrate(): Promise<void> {
  for (const stmt of SCHEMA_STATEMENTS) {
    await query(stmt);
  }
  await seedDemoUser();
}

async function seedDemoUser(): Promise<void> {
  const username = (process.env.DEMO_USERNAME ?? 'demo').trim();
  const password = process.env.DEMO_PASSWORD ?? 'demo1234';
  const hash = await bcrypt.hash(password, 10);

  // The demo user is the first account, so it holds the admin role (matches the
  // "first signup → admin" rule and lets the demo reach the admin settings page).
  const { rows } = await query<{ role: string }>(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash
     RETURNING role`,
    [username, hash],
  );
  const role = rows[0]?.role ?? 'admin';
  // Captured by the post-deploy agent from stdout.
  // eslint-disable-next-line no-console
  console.log(`SEED_CRED ${role} ${username} ${password}`);
}
