import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.user()?.role;

  if (auth.isLoggedIn() && role === 'host') return true;
  if (auth.isLoggedIn() && role === 'vendor') { router.navigate(['/vendor/dashboard']); return false; }
  if (auth.isLoggedIn() && role === 'admin') { router.navigate(['/admin']); return false; }

  const url = route.url.map(s => s.path).join('/');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: url } });
  return false;
};

export const vendorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.user()?.role === 'vendor') return true;
  if (auth.isLoggedIn()) { router.navigate(['/dashboard']); } else { router.navigate(['/vendor/register']); }
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('invitely_admin_token');
  const user = localStorage.getItem('invitely_admin_user');

  if (!token || !user) { router.navigate(['/admin/login']); return false; }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('invitely_admin_token');
      localStorage.removeItem('invitely_admin_user');
      router.navigate(['/admin/login']);
      return false;
    }
  } catch { router.navigate(['/admin/login']); return false; }

  return true;
};

export const requireAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  const path = route.url.map(s => s.path).join('/');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: path } });
  return false;
};

export const momentsCategoryGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login'], { queryParams: { returnUrl: 'moments' } });
  return false;
};