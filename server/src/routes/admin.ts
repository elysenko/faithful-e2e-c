import { Router } from 'express';
import { query } from '../db';
import { requireAdmin, requireAuth } from '../auth/middleware';
import { maskValue, resolveConfig } from '../lib/config';
import { settingsPatchSchema } from '../validation';

// Config keys surfaced on the admin settings page, grouped by backing service.
const MANAGED_KEYS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
];

interface SettingDto {
  key: string;
  value: string;
  configured: boolean;
  updatedAt: string;
}

async function loadUpdatedAt(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const { rows } = await query<{ key: string; updated_at: Date }>(
      'SELECT key, updated_at FROM system_settings',
    );
    for (const row of rows) map.set(row.key, new Date(row.updated_at).toISOString());
  } catch {
    // DB unavailable — timestamps just fall back to empty below.
  }
  return map;
}

async function listSettings(): Promise<SettingDto[]> {
  const updatedAt = await loadUpdatedAt();
  const out: SettingDto[] = [];
  for (const key of MANAGED_KEYS) {
    const value = await resolveConfig(key);
    out.push({
      key,
      value: maskValue(value),
      configured: !!value,
      updatedAt: updatedAt.get(key) ?? '',
    });
  }
  return out;
}

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/settings
adminRouter.get('/settings', async (_req, res, next) => {
  try {
    res.json(await listSettings());
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/settings — upsert key/value pairs (only managed keys accepted).
adminRouter.patch('/settings', async (req, res, next) => {
  try {
    const payload = settingsPatchSchema.parse(req.body);
    for (const [key, value] of Object.entries(payload)) {
      if (!MANAGED_KEYS.includes(key)) continue;
      await query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, value],
      );
    }
    res.json(await listSettings());
  } catch (err) {
    next(err);
  }
});
