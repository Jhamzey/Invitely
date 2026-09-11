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
      <p style="color:var(--text-muted); margin-bottom:24px;">Everything you need to get the most out of Innvitely.</p>

      <div class="help-tabs">
        <button [class.active]="tab === 'start'" (click)="tab = 'start'">Getting started</button>
        <button [class.active]="tab === 'faq'" (click)="tab = 'faq'">FAQ</button>
      </div>

      <div *ngIf="tab === 'start'">
        <h2 class="serif" style="font-size:1.3rem; margin:24px 0 12px;">If you're hosting an event</h2>
        <div class="step" *ngFor="let s of hostSteps; let i = index">
          <div class="step-num">{{ i + 1 }}</div>
          <div><strong>{{ s.title }}</strong><p>{{ s.body }}</p></div>
        </div>

        <h2 class="serif" style="font-size:1.3rem; margin:32px 0 12px;">If you're a vendor</h2>
        <div class="step" *ngFor="let s of vendorSteps; let i = index">
          <div class="step-num">{{ i + 1 }}</div>
          <div><strong>{{ s.title }}</strong><p>{{ s.body }}</p></div>
        </div>
      </div>

      <div class="faqs" *ngIf="tab === 'faq'">
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

    .help-tabs { display: flex; gap: 8px; border-bottom: 0.5px solid var(--border); margin-bottom: 8px; }
    .help-tabs button { background: none; border: none; padding: 10px 4px; margin-right: 20px; font-family: var(--sans); font-size: 14px; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; }
    .help-tabs button.active { color: var(--text-primary); border-bottom-color: var(--accent); font-weight: 500; }

    .step { display: flex; gap: 14px; padding: 12px 0; align-items: flex-start; }
    .step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--surface-2); color: var(--text-primary); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
    .step strong { font-size: 14.5px; color: var(--text-primary); font-family: var(--sans); }
    .step p { font-size: 13.5px; color: var(--text-muted); margin-top: 2px; line-height: 1.6; }

    .faqs { display: flex; flex-direction: column; gap: 0; margin-top: 16px; }
    .faq-item { border-bottom: 0.5px solid var(--border); cursor: pointer; }
    .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; font-size: 15px; font-weight: 500; color: var(--text-primary); font-family: var(--sans); }
    .faq-q svg { flex-shrink: 0; color: var(--text-muted); transition: transform 0.2s; }
    .faq-a { padding: 0 0 16px; font-size: 14px; color: var(--text-muted); font-family: var(--sans); line-height: 1.7; }
  `]
})
export class HelpComponent {
  tab: 'start' | 'faq' = 'start';

  hostSteps = [
    { title: 'Create your event', body: 'Click "New event" on your dashboard, fill in the date, venue and theme, then it\'s ready to build on.' },
    { title: 'Add your guests', body: 'On the Guests page, add people one at a time, or click "Import guests" to upload a spreadsheet or type in a list at once. Duplicate phone numbers/emails are caught automatically.' },
    { title: 'Send invites', body: 'Next to each guest, tap the WhatsApp or email icon — this opens a ready-made personal invite message for you to send. You can track who\'s been sent an invite from the counters above the guest list.' },
    { title: 'Track RSVPs and check guests in', body: 'As guests respond, their status updates automatically on the Guests page. On the day, use the Scan page to check people in by their personal QR code.' },
    { title: 'Browse vendors', body: 'Visit the Vendors marketplace to find caterers, halls, photographers and more — you can save favourites, read reviews, and contact them directly by WhatsApp or phone.' },
    { title: 'Share moments', body: 'Upload photos from the event to your Moments page — they can also appear on the public Moments feed for others to see, like, and comment on.' },
  ];

  vendorSteps = [
    { title: 'Complete your listing', body: 'Fill in your business name, category, cities you serve, a description, your starting price, and your office/store address so hosts know exactly where you are.' },
    { title: 'Upload photos', body: 'Add photos of your work — this is what hosts see first when browsing the marketplace.' },
    { title: 'Get verified', body: 'Submit a quick identity check (a selfie and a photo of your ID) from your profile page. Verified vendors get a badge and appear more trustworthy to hosts.' },
    { title: 'Respond to enquiries', body: 'Hosts will contact you directly by WhatsApp or phone call from your listing — keep your contact details up to date.' },
    { title: 'Build your reputation', body: 'After working with a host, they may leave you a rating and review, visible on your public listing. You\'ll get a notification whenever this happens.' },
  ];

  faqs = [
    { q: 'How do I create my first event?', a: 'After creating an account, click "New event" on your dashboard. Add your event details, choose a theme, then go to the Guests page to add and invite your guests.', open: false },
    { q: 'How are QR codes generated?', a: 'Every guest receives a unique, cryptographically secure QR code when they are added to your event. No two guests share the same code, and codes cannot be duplicated or transferred.', open: false },
    { q: 'Can I scan QR codes without my phone?', a: 'Yes — go to the Scan page for your event and generate a Temporary Security Link. Share this with your security team; it gives one device scan-only access for up to 48 hours, then expires automatically.', open: false },
    { q: 'How does asoebi ordering work?', a: 'Enable asoebi on your event builder and add the items and prices. Guests see them on their invite and can place an order request — you\'ll get a notification straight away with their choice, and you arrange payment and collection with them directly. Payments are not processed automatically through Innvitely at this time.', open: false },
    { q: 'What image formats are supported?', a: 'Innvitely accepts all image and video formats including JPG, PNG, HEIC, HEIF, WebP, MP4, MOV and more. HD and 4K quality is preserved in full.', open: false },
    { q: 'Can I change my theme after publishing?', a: 'Yes — you can update your theme, colours and any event details at any time. Changes reflect immediately on the guest invite links.', open: false },
    { q: 'How do I import a lot of guests at once?', a: 'On the Guests page, click "Import guests". You can upload a CSV/spreadsheet with name, phone and email columns, or type guests in manually. Duplicates already in your list, or repeated within the same upload, are automatically skipped and reported to you.', open: false },
    { q: 'How do WhatsApp and email invites actually get sent?', a: 'Tapping the send icon next to a guest opens WhatsApp or your email app with a ready-written personal invite — you tap send yourself. Innvitely doesn\'t send these automatically on your behalf yet, so nothing goes out without you.', open: false },
    { q: 'What does the Verified badge mean?', a: 'A verified account has submitted a selfie and a valid ID, reviewed by our team. It confirms we\'ve taken a real look at who\'s behind the account — for both hosts and vendors.', open: false },
    { q: 'Can I see who reviewed a vendor?', a: 'Yes — reviews on a vendor\'s page show the reviewer\'s name alongside their rating and comment.', open: false },
    { q: 'How do I contact support?', a: 'Click "WhatsApp support" in the Support section, or email support@innvitely.app. We typically respond within 2 hours during business hours.', open: false },
  ];
}