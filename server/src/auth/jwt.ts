import jwt from 'jsonwebtoken';

export interface JwtClaims {
  sub: number;
  username: string;
  role: 'admin' | 'user';
}

function secret(): string {
  return process.env.JWT_SECRET ?? 'faithfulc-dev-secret-change-me';
}

const EXPIRES_IN = process.env.JWT_EXP ?? '7d';

export function signToken(claims: JwtClaims): string {
  const options = { algorithm: 'HS256', expiresIn: EXPIRES_IN } as jwt.SignOptions;
  return jwt.sign(claims, secret(), options);
}

export function verifyToken(token: string): JwtClaims {
  const decoded = jwt.verify(token, secret(), { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  const { sub, username, role } = decoded as Record<string, unknown>;
  if (typeof sub !== 'number' || typeof username !== 'string' || typeof role !== 'string') {
    throw new Error('Invalid token claims');
  }
  return { sub, username, role: role === 'admin' ? 'admin' : 'user' };
}
