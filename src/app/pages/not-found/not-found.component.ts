import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="not-found" style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:#F8F3E8;">
      <img
        src="/images/404-illustration.png"
        alt="A lost invitation card wandering a maze of paths, looking for its way"
        style="max-width:420px;width:100%;height:auto;margin-bottom:1.5rem;"
      />
      <h1 style="font-size:1.75rem;margin-bottom:0.5rem;">This page wandered off somewhere</h1>
      <p style="max-width:32rem;color:#5b4a36;margin-bottom:1.5rem;">
        The page you're looking for doesn't exist, or the link may be outdated. Let's get you back on track.
      </p>
      <a routerLink="/" style="padding:0.75rem 1.5rem;border-radius:999px;background:#8B7355;color:#fff;text-decoration:none;font-weight:600;">
        Back to Innvitely home
      </a>
    </main>
  `
})
export class NotFoundComponent {}