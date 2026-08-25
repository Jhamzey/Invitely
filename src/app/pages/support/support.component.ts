import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="support-page container">
      <h1 class="serif" style="font-size:2rem; margin-bottom:8px;">Support centre</h1>
      <p style="color:var(--text-muted); margin-bottom:32px;">How can we help you today?</p>
      <div class="sp-grid">
        <a class="sp-card" routerLink="/support/help">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <h3>Help centre</h3>
          <p>FAQs, guides and tutorials</p>
        </a>
        <a class="sp-card" href="https://wa.me/2349000000000" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          <h3>WhatsApp support</h3>
          <p>Chat with our team directly</p>
        </a>
        <a class="sp-card" routerLink="/support/privacy">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h3>Privacy policy</h3>
          <p>How we handle your data</p>
        </a>
        <a class="sp-card" routerLink="/support/terms">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <h3>Terms of use</h3>
          <p>Rules and conditions</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .support-page { padding: 60px 24px; }
    .sp-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; max-width: 640px; }
    .sp-card { background: var(--surface-1); border: 0.5px solid var(--border); border-radius: 12px; padding: 24px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; color: var(--text-primary); transition: border-color 0.2s, transform 0.2s; }
    .sp-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .sp-card svg { color: var(--accent); }
    .sp-card h3 { font-size: 15px; font-weight: 500; font-family: var(--sans); }
    .sp-card p { font-size: 13px; color: var(--text-muted); font-family: var(--sans); }
    @media (max-width: 480px) { .sp-grid { grid-template-columns: 1fr; } }
  `]
})
export class SupportComponent {}