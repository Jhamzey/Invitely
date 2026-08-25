import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Standard host auth guard
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  // Store intended URL for redirect after login
  const url = route.url.map(s => s.path).join('/');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: url } });
  return false;
};

// Vendor-specific guard
export const vendorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.user()?.role === 'vendor') return true;
  if (auth.isLoggedIn()) {
    router.navigate(['/dashboard']); // Host tried vendor route
  } else {
    router.navigate(['/vendor/register']);
  }
  return false;
};

// Admin guard
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.user()?.role === 'admin') return true;
  router.navigate(['/']);
  return false;
};

// Moments/blog category guard — requires auth
export const momentsCategoryGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login'], { queryParams: { returnUrl: 'moments' } });
  return false;
};

// Landing-link auth guard — for footer/nav links that require login
export const requireAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  const path = route.url.map(s => s.path).join('/');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: path } });
  return false;
};