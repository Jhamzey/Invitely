import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GuestService } from '../../core/services/guest.service';
import { EventService } from '../../core/services/event.service';
import { Guest } from '../../core/models/guest.model';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.css']
})
export class GuestsComponent implements OnInit {
  eventId = '';
  event!: Event;
  guests: Guest[] = [];
  loading = true;
  showAddModal = false;
  savingGuest = false;
  guestError = '';
  search = '';
  filter = 'all';
  sending: Record<string, boolean> = {};

  newGuest: Partial<Guest> = {
    name: '', email: '', phone: '', whatsapp: '',
    tableNumber: null, seatNumber: null, mealChoice: ''
  };

  readonly filters = [
    { id: 'all', label: 'All' },
    { id: 'attending', label: 'Attending' },
    { id: 'pending', label: 'Pending' },
    { id: 'declined', label: 'Declined' },
    { id: 'arrived', label: 'Arrived' },
  ];

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getOne(this.eventId).subscribe(e => this.event = e);
    this.loadGuests();
  }

  loadGuests() {
    this.loading = true;
    this.guestService.getAll(this.eventId).subscribe({
      next: guests => { this.guests = guests; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredGuests() {
    return this.guests.filter(g => {
      const matchSearch = !this.search || g.name.toLowerCase().includes(this.search.toLowerCase()) || g.email?.toLowerCase().includes(this.search.toLowerCase());
      const matchFilter = this.filter === 'all' ||
        (this.filter === 'arrived' && g.arrived) ||
        (this.filter !== 'arrived' && g.rsvp === this.filter);
      return matchSearch && matchFilter;
    });
  }

  get stats() {
    return {
      total: this.guests.length,
      attending: this.guests.filter(g => g.rsvp === 'attending').length,
      pending: this.guests.filter(g => g.rsvp === 'pending').length,
      declined: this.guests.filter(g => g.rsvp === 'declined').length,
      arrived: this.guests.filter(g => g.arrived).length,
    };
  }

  addGuest() {
    if (!this.newGuest.name) { this.guestError = 'Guest name is required.'; return; }
    this.savingGuest = true;
    this.guestError = '';
    this.guestService.add(this.eventId, this.newGuest).subscribe({
      next: () => {
        this.showAddModal = false;
        this.newGuest = { name: '', email: '', phone: '', whatsapp: '', tableNumber: null, seatNumber: null, mealChoice: '' };
        this.loadGuests();
        this.savingGuest = false;
      },
      error: err => { this.guestError = err.error?.error || 'Failed to add guest.'; this.savingGuest = false; }
    });
  }

  deleteGuest(id: string) {
    if (!confirm('Delete this guest?')) return;
    this.guestService.delete(this.eventId, id).subscribe(() => this.loadGuests());
  }

  sendWhatsApp(guest: Guest) {
    if (!guest.whatsapp && !guest.phone) { alert('No WhatsApp number for this guest.'); return; }
    const number = (guest.whatsapp || guest.phone).replace(/\D/g, '');
    const link = `https://invitely.app/invite/${guest.uniqueToken}`;
    const msg = encodeURIComponent(
      `Hi ${guest.name}! 🎉\n\nYou're invited to *${this.event?.title}*.\n\nView your personal invitation here:\n${link}\n\nYour QR entry code is included. See you there! ✨`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
    this.guestService.update(this.eventId, guest._id!, { inviteSent: true } as any).subscribe(() => this.loadGuests());
  }

  copyLink(guest: Guest) {
    const link = `${window.location.origin}/invite/${guest.uniqueToken}`;
    navigator.clipboard.writeText(link);
  }

  getRsvpBadge(g: Guest): string {
    if (g.arrived) return 'badge-green';
    if (g.rsvp === 'attending') return 'badge-gold';
    if (g.rsvp === 'declined') return 'badge-red';
    return 'badge-gray';
  }

  getRsvpLabel(g: Guest): string {
    if (g.arrived) return '✓ Arrived';
    if (g.rsvp === 'attending') return 'Attending';
    if (g.rsvp === 'declined') return 'Declined';
    return 'Pending';
  }
}