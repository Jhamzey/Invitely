import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static marketing/shell pages — safe to prerender at build time
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'support', renderMode: RenderMode.Prerender },
  { path: 'support/help', renderMode: RenderMode.Prerender },
  { path: 'support/privacy', renderMode: RenderMode.Prerender },
  { path: 'support/terms', renderMode: RenderMode.Prerender },
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: 'auth/register', renderMode: RenderMode.Prerender },
  { path: 'vendor/register', renderMode: RenderMode.Prerender },

  // Everything else — auth-gated dashboards, and dynamic per-record pages
  // (invite/:token, vendors/:id, scan/session/:token, moments/:category,
  // event/:id/builder, event/:id/seating, event/:id/scan, etc.) —
  // stays plain client-side rendered, exactly like before SSR existed.
  { path: '**', renderMode: RenderMode.Client }
];