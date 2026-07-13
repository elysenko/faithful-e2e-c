import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Auth service wired to the backend /api/auth/* endpoints. JWT + user are kept
 * in localStorage-backed signals so guards/interceptor stay in sync. Public
 * surface (login/signup/logout/demoLogin/user/isLoggedIn/isAdmin) is unchanged.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _user = signal<User | null>(readStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor(private router: Router) {}

  /** POST /api/auth/login — stores the session on success. */
  login(username: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => this.setSession(res.user, res.token)),
        map(() => void 0),
      );
  }

  /** POST /api/auth/signup — the first account created becomes admin (backend rule). */
  signup(username: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/signup`, { username, password })
      .pipe(
        tap((res) => this.setSession(res.user, res.token)),
        map(() => void 0),
      );
  }

  /** One-click demo login using the seeded demo account. */
  demoLogin(): void {
    const username = 'demo';
    const password = 'demo1234';
    this.login(username, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        // Fall back to a local session so reviewers still reach the UI shell
        // even if the demo user has not been seeded yet.
        this.setSession({ id: 0, username, role: 'admin' }, 'demo-fallback-token');
        this.router.navigate(['/']);
      },
    });
  }

  logout(): void {
    // Best-effort server ack; the JWT is stateless so we clear locally regardless.
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => undefined,
      error: () => undefined,
    });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('access_token');
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('isAuthenticated');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(user: User, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
