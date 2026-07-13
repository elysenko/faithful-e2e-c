import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

const TOKEN_KEY = 'token';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);
  const notify = inject(NotificationService);
  const auth = inject(AuthService);
  const token = localStorage.getItem(TOKEN_KEY);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Clear session state (storage + signals) via AuthService so
        // `auth.isLoggedIn()` immediately reflects the unauthenticated state.
        // clearSession() is HTTP-free, so it won't re-trigger the guarded
        // /auth/logout endpoint (which would itself 401 and loop).
        auth.clearSession();
        router.navigate(['/login']);
      } else if (error.status === 503) {
        notify.showServiceUnavailable();
      }
      return throwError(() => error);
    }),
  );
};
