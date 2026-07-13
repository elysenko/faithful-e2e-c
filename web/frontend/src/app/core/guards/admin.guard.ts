import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  return auth.isAdmin() ? true : router.createUrlTree(['/']);
};
