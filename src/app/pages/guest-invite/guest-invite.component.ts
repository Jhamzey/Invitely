import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { GuestService } from '../../core/services/guest.service';
import { Event } from '../../core/models/event.model';
import { Guest } from '../../core/models/guest.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-guest-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './guest-invite.component.html',
  styleUrls: ['./guest-invite.component.css']
})
export class GuestInviteComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  readonly Math = Math;

  token = '';
  event!: Event;
  guest!: Guest;
  loading = true;
  notFound = false;
  revoked = false;
  hostSubaccountCode: string | null = null;

  rsvpDone = false;
  rsvpChoice = '';
  mealChoice = '';
  submittingRsvp = false;

  payerEmail = '';

  asoebiSelected = '';
  asoebiQuantity = 1;
  asoebiDone = false;
  asoebiSubmitting = false;
  asoebiError = '';

  giftAmount = 5000;
  giftCustom = false;
  giftSubmitting = false;
  giftDone = false;
  giftError = '';

  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownInterval: any;

  showQR = false;
  reminderSet = false;

  readonly defaultGreetings: Record<string, string> = {
    wedding: 'you are warmly invited to celebrate our special day',
    birthday: 'you are invited to celebrate with us',
    conference: 'you are cordially invited to attend',
    owambe: 'you are warmly invited to join the celebration',
    traditional: 'you are cordially invited to this traditional ceremony',
    other: 'you are invited',
  };
  readonly defaultClosings: Record<string, string> = {
    wedding: 'With love & joy',
    birthday: 'With so much love',
    conference: 'We look forward to your presence',
    owambe: 'With love and celebration',
    traditional: 'With honour and joy',
    other: 'Looking forward to seeing you',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private guestService: GuestService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.eventService.getInvite(this.token).subscribe({
      next: (res: any) => {
        if (res.revoked) { this.revoked = true; this.loading = false; return; }
        this.event = res.event;
        this.guest = res.guest;
        this.hostSubaccountCode = res.hostSubaccountCode;
        this.loading = false;
        if (this.guest.rsvp !== 'pending') this.rsvpDone = true;
        this.startCountdown();
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  ngOnDestroy() { if (this.isBrowser) clearInterval(this.countdownInterval); }

  get currentTheme() {
    const map: Record<string, { bg: string; color: string; accent: string }> = {
      ivory: { bg: 'linear-gradient(135deg,#F8F3E8,#E8DFD0)', color: '#3D2E1A', accent: '#8B7355' },
      gold: { bg: 'linear-gradient(135deg,#2A1F0E,#4A3520)', color: '#F5E6C4', accent: '#C9A84C' },
      lavender: { bg: 'linear-gradient(135deg,#E8E0F0,#D4C8E8)', color: '#2D1F45', accent: '#6B4F8C' },
      emerald: { bg: 'linear-gradient(135deg,#0D2B20,#1A4A35)', color: '#D4EDE4', accent: '#2E6B5E' },
      rose: { bg: 'linear-gradient(135deg,#F0E0E5,#E0C5CE)', color: '#3D1020', accent: '#C4546A' },
      navy: { bg: 'linear-gradient(135deg,#0A1628,#1A2D4A)', color: '#C5D8F0', accent: '#4A7FC0' },
    };
    return map[this.event?.theme] || map['ivory'];
  }

  get greeting(): string {
    return this.event?.greetingText || this.defaultGreetings[this.event?.type || 'other'] || this.defaultGreetings['other'];
  }

  get closing(): string {
    return this.event?.closingText || this.defaultClosings[this.event?.type || 'other'] || this.defaultClosings['other'];
  }

  startCountdown() {
    if (!this.isBrowser) return;
    const update = () => {
      const diff = new Date(this.event.date).getTime() - Date.now();
      if (diff <= 0) { clearInterval(this.countdownInterval); return; }
      this.countdown.days = Math.floor(diff / 86400000);
      this.countdown.hours = Math.floor((diff % 86400000) / 3600000);
      this.countdown.minutes = Math.floor((diff % 3600000) / 60000);
      this.countdown.seconds = Math.floor((diff % 60000) / 1000);
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  submitRsvp() {
    if (!this.rsvpChoice) return;
    this.submittingRsvp = true;
    this.guestService.rsvp(this.token, this.rsvpChoice, this.mealChoice).subscribe({
      next: g => { this.guest = g; this.rsvpDone = true; this.submittingRsvp = false; },
      error: () => this.submittingRsvp = false
    });
  }

  get asoebiSelectedPrice(): number {
    return this.event?.asoebi?.find(a => a.name === this.asoebiSelected)?.price || 0;
  }

  private loadPaystackScript(cb: () => void) {
    if ((window as any).PaystackPop) { cb(); return; }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = cb;
    document.body.appendChild(script);
  }

  payAsoebi() {
    if (!this.asoebiSelected || !this.isBrowser || this.asoebiSubmitting || !this.hostSubaccountCode) return;
    const item = this.event.asoebi?.find(a => a.name === this.asoebiSelected);
    if (!item) return;

    const email = this.guest.email || this.payerEmail;
    if (!email) { this.asoebiError = 'Please enter your email to continue.'; return; }

    this.asoebiError = '';
    this.loadPaystackScript(() => {
      const handler = (window as any).PaystackPop.setup({
        key: environment.paystackPublicKey,
        email,
        amount: item.price * this.asoebiQuantity * 100,
        currency: 'NGN',
        subaccount: this.hostSubaccountCode,
        bearer: 'subaccount',
        metadata: { guestName: this.guest.name, itemName: item.name, quantity: this.asoebiQuantity },
        callback: (response: any) => this.verifyAsoebiPayment(response.reference),
        onClose: () => {},
      });
      handler.openIframe();
    });
  }

  private verifyAsoebiPayment(reference: string) {
    this.asoebiSubmitting = true;
    this.eventService.verifyAsoebiPayment(this.token, this.asoebiSelected, this.asoebiQuantity, reference).subscribe({
      next: () => { this.asoebiDone = true; this.asoebiSubmitting = false; },
      error: err => { this.asoebiError = err.error?.error || 'Payment went through but we could not confirm your order — please contact the host directly.'; this.asoebiSubmitting = false; }
    });
  }

  payGift() {
    if (!this.isBrowser || this.giftSubmitting || this.giftAmount < 100 || !this.hostSubaccountCode) return;
    const email = this.guest.email || this.payerEmail;
    if (!email) { this.giftError = 'Please enter your email to continue.'; return; }

    this.giftError = '';
    this.loadPaystackScript(() => {
      const handler = (window as any).PaystackPop.setup({
        key: environment.paystackPublicKey,
        email,
        amount: this.giftAmount * 100,
        currency: 'NGN',
        subaccount: this.hostSubaccountCode,
        bearer: 'subaccount',
        transaction_charge: 0,
        metadata: { guestName: this.guest.name },
        callback: (response: any) => this.verifyGiftPayment(response.reference),
        onClose: () => {},
      });
      handler.openIframe();
    });
  }

  private verifyGiftPayment(reference: string) {
    this.giftSubmitting = true;
    this.eventService.verifyGift(this.token, this.giftAmount, reference).subscribe({
      next: () => { this.giftDone = true; this.giftSubmitting = false; },
      error: err => { this.giftError = err.error?.error || 'Payment went through but we could not confirm it — please contact support.'; this.giftSubmitting = false; }
    });
  }

  openMaps() {
    if (!this.isBrowser) return;
    const addr = encodeURIComponent(this.event.venueAddress || this.event.venue);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
  }

  setReminder() {
    if (!this.isBrowser) return;
    const eventDate = new Date(this.event.date);
    const title = encodeURIComponent(this.event.title);
    const details = encodeURIComponent(`You are invited to ${this.event.title} at ${this.event.venue}`);
    const start = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${start}`, '_blank');
    this.reminderSet = true;
  }

  getTableGuests(): string[] {
    const t = this.event.tables?.find(t => t.tableNumber === this.guest.tableNumber);
    return t?.seats.filter(s => s.guestName && s.guestId !== this.guest._id).map(s => s.guestName!) || [];
  }
}