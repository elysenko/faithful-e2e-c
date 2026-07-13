import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { signToken } from '../auth/jwt';
import { requireAuth } from '../auth/middleware';
import { HttpError } from '../middleware/errors';
import { credentialsSchema } from '../validation';

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
}

function publicUser(row: Pick<UserRow, 'id' | 'username' | 'role'>) {
  return { id: row.id, username: row.username, role: row.role };
}

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = credentialsSchema.parse(req.body);
    const { rows } = await query<UserRow>(
      'SELECT id, username, password_hash, role FROM users WHERE lower(username) = lower($1)',
      [username],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const token = signToken({ sub: user.id, username: user.username, role: user.role });
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signup — first user becomes admin, everyone else is a user.
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = credentialsSchema.parse(req.body);
    const existing = await query<UserRow>(
      'SELECT id FROM users WHERE lower(username) = lower($1)',
      [username],
    );
    if (existing.rows.length > 0) {
      throw new HttpError(409, 'Username already taken');
    }
    const countRes = await query<{ count: string }>('SELECT count(*)::int AS count FROM users');
    const role: 'admin' | 'user' = Number(countRes.rows[0]?.count ?? 0) === 0 ? 'admin' : 'user';
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query<UserRow>(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role`,
      [username, hash, role],
    );
    const user = rows[0];
    const token = signToken({ sub: user.id, username: user.username, role: user.role });
    res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query<UserRow>(
      'SELECT id, username, role FROM users WHERE id = $1',
      [req.user!.id],
    );
    const user = rows[0];
    if (!user) throw new HttpError(401, 'User no longer exists');
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout — stateless JWT, so this is a client-side no-op ack.
authRouter.post('/logout', requireAuth, (_req, res) => {
  res.json({ ok: true });
});
