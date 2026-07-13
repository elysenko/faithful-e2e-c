import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';

/** roleGuard — restrict a route to specific roles via route.data.roles. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data?.['roles'] as Role[] | undefined) ?? [];

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  const role = auth.role();
  if (allowed.length === 0 || (role && allowed.includes(role))) {
    return true;
  }
  // Wrong role → send home.
  return router.createUrlTree(['/']);
};
