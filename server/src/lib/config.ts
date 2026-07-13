import { query } from '../db';

const PLACEHOLDER = 'PLACEHOLDER_CONFIGURE_IN_SETTINGS';

/**
 * Resolve a configuration value. Priority:
 *   1. process.env[key] (unless it equals the placeholder sentinel)
 *   2. system_settings DB row
 *   3. null (caller decides whether that is an error)
 */
export async function resolveConfig(key: string): Promise<string | null> {
  const fromEnv = process.env[key];
  if (fromEnv && fromEnv !== PLACEHOLDER) return fromEnv;
  try {
    const { rows } = await query<{ value: string }>(
      'SELECT value FROM system_settings WHERE key = $1',
      [key],
    );
    if (rows[0]?.value) return rows[0].value;
  } catch {
    // DB unavailable — fall through to env-only result.
  }
  return null;
}

export function maskValue(value: string | null): string {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(12, value.length - 2))}${value.slice(-2)}`;
}
