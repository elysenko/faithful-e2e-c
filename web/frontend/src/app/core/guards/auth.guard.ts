import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const TOKEN_KEY = 'token';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? true : router.createUrlTree(['/login']);
};
