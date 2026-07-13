import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../models';

const TOKEN_KEY = 'token';
const ACCESS_KEY = 'access_token';
const USER_KEY = 'user';
const AUTH_FLAG = 'isAuthenticated';

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/**
 * FaithfulC authentication state. Talks to the NestJS backend at
 * `${apiUrl}/auth/*`, persists the JWT, and exposes `isAdmin` for the role
 * guard. After login/signup it redirects to the recipe box.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private _user = signal<User | null>(readUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  hasRole(...roles: Role[]): boolean {
    const r = this._user()?.role;
    return r ? roles.includes(r) : false;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  /** Open signup — the first user server-side becomes an admin, later ones users. */
  signup(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/signup`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  /**
   * Refresh the authenticated user from the real backend (`GET /auth/me`) and
   * update the cached signal + localStorage. Resilient: on error (e.g. demo
   * token, transient failure) the cached user is preserved.
   */
  refresh(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
    );
  }

  private persist(res: AuthResponse): void {
    const token = res.access_token || res.token || '';
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(AUTH_FLAG, 'true');
    this._user.set(res.user);
    this.router.navigate(['/']);
  }

  /** Demo Mode — bypass the backend so reviewers can inspect the authenticated UI. */
  demoLogin(role: Role = 'admin'): void {
    const user: User =
      role === 'admin'
        ? { id: 'demo-admin', email: 'demo@faithfulc.app', name: 'Demo Cook', role: 'admin' }
        : { id: 'demo-user', email: 'cook@faithfulc.app', name: 'Home Cook', role: 'user' };
    const token = 'demo-token';
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_FLAG, 'true');
    this._user.set(user);
    this.router.navigate(['/']);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_FLAG);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
