import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="policy-page container">
      <a class="back-link" routerLink="/support">← Support</a>
      <h1 class="serif" style="font-size:2rem; margin-bottom:4px;">Terms of use</h1>
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
export class TermsComponent {
  sections = [
    { title: '1. Acceptance of terms', body: 'By creating an account or using Innvitely, you agree to these Terms of Use. If you do not agree, please do not use the service.' },
    { title: '2. Permitted use', body: 'Innvitely is for legitimate event planning and invitation management. You may not use Innvitely for illegal activities, to harass others, to distribute spam, or to create fraudulent invitations.' },
    { title: '3. Host responsibilities', body: 'As an event host, you are responsible for the accuracy of event information you provide, obtaining consent from guests before adding their contact details, and ensuring asoebi or gift payments are handled transparently.' },
    { title: '4. Vendor responsibilities', body: 'Vendors must provide accurate business information and genuine credentials during registration. Providing false information will result in permanent removal. Vendors are solely responsible for services they provide to event hosts.' },
    { title: '5. Payments', body: 'Payments processed through Innvitely (asoebi, gift support, vendor subscriptions) are handled by Paystack and subject to Paystack\'s terms. Innvitely charges a platform fee of 1.5% + ₦100 per transaction.' },
    { title: '6. Content', body: 'You retain ownership of content you upload (photos, videos, event details). By uploading, you grant Innvitely a license to display this content as part of the service. You may not upload content that infringes copyright or is illegal.' },
    { title: '7. Termination', body: 'Innvitely reserves the right to suspend or terminate accounts that violate these terms. You may delete your account at any time. Termination does not automatically refund any payments made.' },
    { title: '8. Contact', body: 'Questions about these terms can be directed to legal@innvitely.app.' },
  ];
}