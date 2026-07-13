import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Thrown whenever the database is unreachable (connection refused, timeout,
 * auth failure, missing DATABASE_URL). The central error handler maps this to
 * an HTTP 503 so the API stays predictable when Postgres is down.
 */
export class DbUnavailableError extends Error {
  readonly cause?: unknown;
  constructor(message = 'Database unavailable', cause?: unknown) {
    super(message);
    this.name = 'DbUnavailableError';
    this.cause = cause;
  }
}

// Postgres connection-level error codes / node errno values that mean
// "the server is not reachable" rather than "your query was bad".
const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ECONNRESET',
  'EPIPE',
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '57P03', // cannot_connect_now
  '08000', // connection_exception
  '08003', // connection_does_not_exist
  '08006', // connection_failure
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08004', // sqlserver_rejected_establishment_of_sqlconnection
  '53300', // too_many_connections
]);

function isConnectionError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return !!code && CONNECTION_ERROR_CODES.has(code);
}

let pool: Pool | null = null;

/** Lazily construct the shared pg Pool from DATABASE_URL. */
export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DbUnavailableError('DATABASE_URL is not configured');
  }
  pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 10),
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: 30000,
  });
  // A pool-level 'error' listener prevents the process from crashing when an
  // idle client drops (e.g. Postgres restarts).
  pool.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[db] idle client error:', err.message);
  });
  return pool;
}

/**
 * Run a parameterised query. Any connection failure is re-thrown as a typed
 * DbUnavailableError; genuine query errors (bad SQL, constraint violations)
 * propagate unchanged so callers can handle them.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<QueryResult<T>> {
  try {
    const p = getPool();
    return await p.query<T>(text, params as unknown[]);
  } catch (err) {
    if (err instanceof DbUnavailableError) throw err;
    if (isConnectionError(err)) {
      throw new DbUnavailableError('Database unavailable', err);
    }
    throw err;
  }
}

/** Acquire a client for a transaction; connection failures become 503s. */
export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  let client: PoolClient;
  try {
    client = await getPool().connect();
  } catch (err) {
    if (isConnectionError(err)) throw new DbUnavailableError('Database unavailable', err);
    throw err;
  }
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/** Lightweight liveness probe used by /api/health/deep. Returns true if SELECT 1 works. */
export async function pingDb(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
