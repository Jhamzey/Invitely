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
      <p style="color:var(--text-muted); font-family:var(--sans); font-size:13px; margin-bottom:32px;">Last updated: September 2026</p>

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
    { title: '1. Information we collect', body: 'We collect information you provide when creating an account (name, email, password, username), event information (venue, guest list, seating plans), vendor business details, and reviews you write or receive. If you choose to complete identity verification, we also collect a selfie photo, a photo of a government-issued ID (such as a NIN, driver\'s licence, passport or voter\'s card), and the ID number. Payment information for vendor plan upgrades is processed securely by Paystack — we do not store payment card details on our servers.' },
    { title: '2. How we use your information', body: 'We use your information to provide the Innvitely service, send you notifications about your account and events, verify vendor and host identities, and improve our platform. We never sell your data to third parties.' },
    { title: '3. Identity verification data', body: 'Selfie and ID document photos are used solely to manually confirm that an account belongs to a real person matching the ID provided. These images are reviewed by a member of our team — we do not use automated facial recognition. Access to this content is restricted to authorised reviewers, and the images are stored using restricted, non-public delivery rather than an ordinary public link. You can request deletion of your verification documents at any time, whether or not your verification was approved.' },
    { title: '4. Guest data', body: 'When you add guests to your event, you are responsible for having their permission to share their contact details with Innvitely. Guest QR codes and attendance records are stored securely and only accessible to the event host and anyone they\'ve added as a collaborator with the relevant permission.' },
    { title: '5. Asoebi and vendor payments', body: 'If you enable asoebi ordering, guest order requests (item, price, guest name) are stored and shown to the host, but Innvitely does not process or hold this payment — hosts and guests arrange payment between themselves. Only vendor plan upgrades are processed through Paystack.' },
    { title: '6. Data storage', body: 'All data is stored on secure servers with encryption at rest and in transit. Media files (photos, videos) are stored on Cloudinary\'s secure CDN infrastructure; identity verification images specifically use restricted, authenticated delivery rather than plain public URLs. We retain your data for as long as your account is active.' },
    { title: '7. Platform security records', body: 'For security and accountability, certain actions taken on the platform (such as account suspensions, vendor verification decisions, and admin actions) are recorded in an internal audit log. This log records what action was taken and by whom — it does not expose your private content to other users.' },
    { title: '8. Your rights', body: 'You can request deletion of your account and all associated data, including identity verification documents, at any time by contacting support@innvitely.app. We will process deletion requests within 30 days.' },
    { title: '9. Cookies', body: 'We use essential cookies to keep you logged in and remember your preferences (such as dark mode). We do not use advertising or tracking cookies.' },
    { title: '10. Contact', body: 'For privacy-related questions, contact us at privacy@innvitely.app or WhatsApp our support team.' },
  ];
}