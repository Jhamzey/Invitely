import { Routes } from '@angular/router';
import { authGuard, vendorGuard, adminGuard, requireAuthGuard, momentsCategoryGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // ── PUBLIC — landing, auth, guest invite ──────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'invite/:token',
    loadComponent: () => import('./pages/guest-invite/guest-invite.component').then(m => m.GuestInviteComponent)
  },
  // Scan session — accessed by security device with temp token, no full auth
  {
    path: 'scan/session/:token',
    loadComponent: () => import('./pages/scan/scan-session/scan-session.component').then(m => m.ScanSessionComponent)
  },

  // ── SUPPORT PAGES ─────────────────────────────────────────────────
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent)
  },
  {
    path: 'support/help',
    loadComponent: () => import('./pages/support/help/help.component').then(m => m.HelpComponent)
  },
  {
    path: 'support/privacy',
    loadComponent: () => import('./pages/support/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'support/terms',
    loadComponent: () => import('./pages/support/terms/terms.component').then(m => m.TermsComponent)
  },

  // ── REQUIRES AUTH — vendor listing & vendors page ─────────────────
  {
    path: 'vendors',
    loadComponent: () => import('./pages/vendors/vendors.component').then(m => m.VendorsComponent),
    canActivate: [requireAuthGuard]
  },
  {
    path: 'vendors/:id',
    loadComponent: () => import('./pages/vendors/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent),
    canActivate: [requireAuthGuard]
  },

  // ── MOMENTS — requires auth, with category filter ─────────────────
  {
    path: 'moments',
    loadComponent: () => import('./pages/moments/moments-feed/moments-feed.component').then(m => m.MomentsFeedComponent),
    canActivate: [momentsCategoryGuard]
  },
  {
    path: 'moments/:category',
    loadComponent: () => import('./pages/moments/moments-feed/moments-feed.component').then(m => m.MomentsFeedComponent),
    canActivate: [momentsCategoryGuard]
  },

  // ── HOST ROUTES ───────────────────────────────────────────────────
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event/:id/builder',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event/:id/guests',
    loadComponent: () => import('./pages/guests/guests.component').then(m => m.GuestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event/:id/seating',
    loadComponent: () => import('./pages/seating/seating.component').then(m => m.SeatingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event/:id/moments',
    loadComponent: () => import('./pages/moments/moments.component').then(m => m.MomentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'event/:id/scan',
    loadComponent: () => import('./pages/scan/scan.component').then(m => m.ScanComponent),
    canActivate: [authGuard]
  },

  // ── VENDOR ROUTES ─────────────────────────────────────────────────
  {
    path: 'vendor/register',
    loadComponent: () => import('./pages/vendor-register/vendor-register.component').then(m => m.VendorRegisterComponent)
  },
  {
    path: 'vendor/dashboard',
    loadComponent: () => import('./pages/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
    canActivate: [vendorGuard]
  },
  {
    path: 'vendor/profile',
    loadComponent: () => import('./pages/vendor-profile/vendor-profile.component').then(m => m.VendorProfileComponent),
    canActivate: [vendorGuard]
  },

  // ── ADMIN ────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '' }
];