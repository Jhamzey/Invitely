import { Routes } from '@angular/router';
import { authGuard, vendorGuard, adminGuard, requireAuthGuard, momentsCategoryGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent), data: { title: 'Home', description: 'Discover and connect with vendors for your next event.' } },
  { path: 'auth/login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent), data: { title: 'Login', description: 'Access your account to manage events, vendors, and more.' } },
  { path: 'auth/register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent), data: { title: 'Register', description: 'Create a new account to get started.' } },
  { path: 'invite/:token', loadComponent: () => import('./pages/guest-invite/guest-invite.component').then(m => m.GuestInviteComponent)},
  { path: 'scan/session/:token', loadComponent: () => import('./pages/scan/scan-session/scan-session.component').then(m => m.ScanSessionComponent) },

  // Support
  { path: 'support', loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent), data: { title: 'Support', description: 'Get help and support for your account and services.' } },
  { path: 'support/help', loadComponent: () => import('./pages/support/help/help.component').then(m => m.HelpComponent), data: { title: 'Help Center', description: 'Find answers to your questions and get assistance.' } },
  { path: 'support/privacy', loadComponent: () => import('./pages/support/privacy/privacy.component').then(m => m.PrivacyComponent), data: { title: 'Privacy Policy', description: 'Learn how we collect, use, and protect your information.' } },
  { path: 'support/terms', loadComponent: () => import('./pages/support/terms/terms.component').then(m => m.TermsComponent), data: { title: 'Terms of Service', description: 'Understand the terms and conditions of using our services.' } },

  // Auth-required public pages
  { path: 'vendors', loadComponent: () => import('./pages/vendors/vendors.component').then(m => m.VendorsComponent), canActivate: [requireAuthGuard], data: { title: 'Find Vendors', description: 'Browse verified caterers, halls, photographers and more for your next event.' } },
  { path: 'vendors/:id', loadComponent: () => import('./pages/vendors/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent), canActivate: [requireAuthGuard] },
  { path: 'moments', loadComponent: () => import('./pages/moments/moments-feed/moments-feed.component').then(m => m.MomentsFeedComponent), canActivate: [momentsCategoryGuard], data: { title: 'Moments', description: 'Share and discover memorable moments from your events.' } },
  { path: 'moments/:category', loadComponent: () => import('./pages/moments/moments-feed/moments-feed.component').then(m => m.MomentsFeedComponent), canActivate: [momentsCategoryGuard] },

  // Host
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'event/:id/builder', loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent), canActivate: [authGuard] },
  { path: 'event/:id/guests', loadComponent: () => import('./pages/guests/guests.component').then(m => m.GuestsComponent), canActivate: [authGuard] },
  { path: 'event/:id/seating', loadComponent: () => import('./pages/seating/seating.component').then(m => m.SeatingComponent), canActivate: [authGuard] },
  { path: 'event/:id/moments', loadComponent: () => import('./pages/moments/moments.component').then(m => m.MomentsComponent), canActivate: [authGuard] },
  { path: 'event/:id/scan', loadComponent: () => import('./pages/scan/scan.component').then(m => m.ScanComponent), canActivate: [authGuard] },
  { path: 'event/:id/collaborate', loadComponent: () => import('./pages/collaborate/collaborate.component').then(m => m.CollaborateComponent), canActivate: [authGuard] },

  // Vendor
  { path: 'vendor/register', loadComponent: () => import('./pages/vendor-register/vendor-register.component').then(m => m.VendorRegisterComponent) },
  { path: 'vendor/dashboard', loadComponent: () => import('./pages/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent), canActivate: [vendorGuard] },
  { path: 'vendor/profile', loadComponent: () => import('./pages/vendor-profile/vendor-profile.component').then(m => m.VendorProfileComponent), canActivate: [vendorGuard] },

  //Verification
  { path: 'verify-identity', loadComponent: () => import('./pages/verification/verification.component').then(m => m.VerificationComponent), canActivate: [authGuard], data: { title: 'Verify Identity', description: 'Verify your identity to ensure the security of your account.' } },

  // Admin — separate auth
  { path: 'admin/login', loadComponent: () => import('./pages/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];