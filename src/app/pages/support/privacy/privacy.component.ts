import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="policy-page container">
      <a class="back-link" routerLink="/support">← Support</a>
      <h1 class="serif" style="font-size:2rem; margin-bottom:4px;">Privacy policy</h1>
      <p style="color:var(--text-muted); font-family:var(--sans); font-size:13px; margin-bottom:32px;">Last updated: January 2026</p>

      <div class="policy-body" *ngFor="let s of sections">
        <h2>{{ s.title }}</h2>
        <p>{{ s.body }}</p>
      </div>
    </div>
  `,
  styles: [`
    .policy-page { padding: 40px 24px; max-width: 700px; }
    .back-link { font-size: 13px; color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 20px; }
    .policy-body { margin-bottom: 24px; }
    .policy-body h2 { font-size: 1.1rem; font-weight: 500; font-family: var(--sans); color: var(--text-primary); margin-bottom: 8px; }
    .policy-body p { font-size: 14px; color: var(--text-secondary); font-family: var(--sans); line-height: 1.75; }
  `]
})
export class PrivacyComponent {
  sections = [
    { title: '1. Information we collect', body: 'We collect information you provide when creating an account (name, email, password), event information (venue, guest list, seating plans), and payment information processed securely by Paystack. We do not store payment card details on our servers.' },
    { title: '2. How we use your information', body: 'We use your information to provide the Invitely service, send event-related notifications, process payments, verify vendor credentials, and improve our platform. We never sell your data to third parties.' },
    { title: '3. Guest data', body: 'When you add guests to your event, you are responsible for having their permission to share their contact details with Invitely. Guest QR codes and attendance records are stored securely and only accessible to the event host.' },
    { title: '4. Data storage', body: 'All data is stored on secure servers with encryption at rest and in transit. Media files (photos, videos) are stored on Cloudinary\'s secure CDN infrastructure. We retain your data for as long as your account is active.' },
    { title: '5. Your rights', body: 'You can request deletion of your account and all associated data at any time by contacting support@invitely.app. We will process deletion requests within 30 days.' },
    { title: '6. Cookies', body: 'We use essential cookies to keep you logged in and remember your preferences (such as dark mode). We do not use advertising or tracking cookies.' },
    { title: '7. Contact', body: 'For privacy-related questions, contact us at privacy@invitely.app or WhatsApp our support team.' },
  ];
}