import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { GuestService } from '../../core/services/guest.service';
import { Event } from '../../core/models/event.model';
import { Guest } from '../../core/models/guest.model';

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

  token = '';
  event!: Event;
  guest!: Guest;
  loading = true;
  notFound = false;

  rsvpDone = false;
  rsvpChoice = '';
  mealChoice = '';
  submittingRsvp = false;

  asoebiSelected = '';
  asoebiDone = false;
  asoebiSubmitting = false;
  asoebiError = '';

  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownInterval: any;

  showQR = false;
  reminderSet = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private guestService: GuestService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.eventService.getInvite(this.token).subscribe({
      next: ({ event, guest }) => {
        this.event = event;
        this.guest = guest;
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

  orderAsoebi() {
    if (!this.asoebiSelected || this.asoebiSubmitting) return;
    this.asoebiSubmitting = true;
    this.asoebiError = '';
    this.eventService.orderAsoebi(this.token, this.asoebiSelected).subscribe({
      next: () => { this.asoebiDone = true; this.asoebiSubmitting = false; },
      error: err => { this.asoebiError = err.error?.error || 'Could not place your order. Please try again.'; this.asoebiSubmitting = false; }
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