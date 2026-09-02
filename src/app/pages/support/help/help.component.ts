import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="help-page container">
      <a class="back-link" routerLink="/support">← Support</a>
      <h1 class="serif" style="font-size:2rem; margin-bottom:8px;">Help centre</h1>
      <p style="color:var(--text-muted); margin-bottom:32px;">Answers to the most common questions about Innvitely.</p>

      <div class="faqs">
        <div class="faq-item" *ngFor="let faq of faqs" (click)="faq.open = !faq.open">
          <div class="faq-q">
            {{ faq.q }}
            <svg [style.transform]="faq.open ? 'rotate(180deg)' : ''" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="faq-a" *ngIf="faq.open">{{ faq.a }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .help-page { padding: 40px 24px; max-width: 700px; }
    .back-link { font-size: 13px; color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 20px; }
    .back-link:hover { color: var(--text-primary); }
    .faqs { display: flex; flex-direction: column; gap: 0; }
    .faq-item { border-bottom: 0.5px solid var(--border); cursor: pointer; }
    .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; font-size: 15px; font-weight: 500; color: var(--text-primary); font-family: var(--sans); }
    .faq-q svg { flex-shrink: 0; color: var(--text-muted); transition: transform 0.2s; }
    .faq-a { padding: 0 0 16px; font-size: 14px; color: var(--text-muted); font-family: var(--sans); line-height: 1.7; }
  `]
})
export class HelpComponent {
  faqs = [
    { q: 'How do I create my first event?', a: 'After creating an account, click "New event" on your dashboard. Add your event details, choose a theme, then go to the Guests page to add and invite your guests.', open: false },
    { q: 'How are QR codes generated?', a: 'Every guest receives a unique, cryptographically secure QR code when they are added to your event. No two guests share the same code, and codes cannot be duplicated or transferred.', open: false },
    { q: 'Can I scan QR codes without my phone?', a: 'Yes — go to the Scan page for your event and generate a Temporary Security Link. Share this with your security team; it gives one device scan-only access for up to 48 hours, then expires automatically.', open: false },
    { q: 'How does asoebi payment work?', a: 'Enable asoebi on your event builder, add the items and prices. Guests see them on their invite and can order and pay directly through Paystack. Funds are sent to your registered bank account.', open: false },
    { q: 'What image formats are supported?', a: 'Innvitely accepts all image and video formats including JPG, PNG, HEIC, HEIF, WebP, MP4, MOV and more. HD and 4K quality is preserved in full.', open: false },
    { q: 'Can I change my theme after publishing?', a: 'Yes — you can update your theme, colours and any event details at any time. Changes reflect immediately on the guest invite links.', open: false },
    { q: 'How do I contact support?', a: 'Click "WhatsApp support" in the Support section, or email support@innvitely.app. We typically respond within 2 hours during business hours.', open: false },
  ];
}