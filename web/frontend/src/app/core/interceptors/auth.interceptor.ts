import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'token';

/**
 * Attaches the JWT Bearer token from localStorage to every request and, on a
 * 401, clears the session and redirects to /login.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
