import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import Papa from 'papaparse';
import { GuestService } from '../../core/services/guest.service';
import { EventService } from '../../core/services/event.service';
import { Guest } from '../../core/models/guest.model';
import { Event } from '../../core/models/event.model';
import { environment } from '../../../environments/environment';

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
  exportingCsv = false;

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

  // --- Import (CSV / manual) ---
  showImportModal = false;
  importTab: 'csv' | 'manual' = 'csv';
  importRows: { name: string; phone: string; email: string }[] = [{ name: '', phone: '', email: '' }];
  importFile: File | null = null;
  importParsing = false;
  importSubmitting = false;
  importError = '';
  importResult: { importedCount: number; duplicateCount: number; duplicates: any[] } | null = null;

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

  get sendStats() {
    return {
      whatsappSent: this.guests.filter(g => g.inviteSent).length,
      emailSent: this.guests.filter(g => g.emailSent).length,
      notSent: this.guests.filter(g => !g.inviteSent && !g.emailSent).length,
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

  recallGuest(guest: Guest) {
    if (!confirm(`Revoke ${guest.name}'s invitation? Their link will stop working.`)) return;
    this.guestService.revoke(this.eventId, guest._id!).subscribe(() => this.loadGuests());
  }

  sendWhatsApp(guest: Guest) {
    if (!guest.whatsapp && !guest.phone) { alert('No WhatsApp number for this guest.'); return; }
    const number = (guest.whatsapp || guest.phone).replace(/\D/g, '');
    const link = `${environment.siteUrl}/invite/${guest.uniqueToken}`;
    const msg = encodeURIComponent(
      `Hi ${guest.name}! 🎉\n\nYou're invited to *${this.event?.title}*.\n\nView your personal invitation here:\n${link}\n\nYour QR entry code is included. See you there! ✨`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
    this.guestService.update(this.eventId, guest._id!, { inviteSent: true } as any).subscribe(() => this.loadGuests());
  }

  sendEmail(guest: Guest) {
    if (!guest.email) { alert('No email address for this guest.'); return; }
    const link = `${environment.siteUrl}/invite/${guest.uniqueToken}`;
    const subject = encodeURIComponent(`You're invited to ${this.event?.title}`);
    const body = encodeURIComponent(`Hi ${guest.name},\n\nYou're invited to ${this.event?.title}.\n\nView your personal invitation here:\n${link}\n\nSee you there!`);
    window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`, '_blank');
    this.guestService.update(this.eventId, guest._id!, { emailSent: true } as any).subscribe(() => this.loadGuests());
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

  // --- Import ---
  openImport() {
    this.showImportModal = true;
    this.importResult = null;
    this.importError = '';
    this.importRows = [{ name: '', phone: '', email: '' }];
    this.importFile = null;
    this.importTab = 'csv';
  }

  closeImport() { this.showImportModal = false; }

  addImportRow() { this.importRows.push({ name: '', phone: '', email: '' }); }
  removeImportRow(i: number) { this.importRows.splice(i, 1); }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    this.importFile = input.files?.[0] || null;
  }

  parseAndImport() {
    this.importError = '';
    if (this.importTab === 'csv') {
      if (!this.importFile) { this.importError = 'Choose a CSV file first.'; return; }
      this.importParsing = true;
      Papa.parse(this.importFile, {
        header: true,
        skipEmptyLines: true,
        complete: (result: any) => {
          this.importParsing = false;
          const rows = (result.data as any[]).map(r => ({
            name: (r.name || r.Name || '').toString().trim(),
            phone: (r.phone || r.Phone || r.whatsapp || r.WhatsApp || '').toString().trim(),
            email: (r.email || r.Email || '').toString().trim(),
          })).filter(r => r.name);
          if (rows.length === 0) {
            this.importError = 'No valid rows found — make sure your file has a "name" column.';
            return;
          }
          this.submitImport(rows);
        },
        error: () => { this.importParsing = false; this.importError = 'Could not read that file.'; }
      });
    } else {
      const rows = this.importRows.filter(r => r.name.trim());
      if (rows.length === 0) { this.importError = 'Add at least one guest with a name.'; return; }
      this.submitImport(rows);
    }
  }

  private submitImport(rows: { name: string; phone: string; email: string }[]) {
    this.importSubmitting = true;
    const guests = rows.map(r => ({ name: r.name, whatsapp: r.phone, phone: r.phone, email: r.email }));
    this.guestService.bulkAdd(this.eventId, guests).subscribe({
      next: res => {
        this.importResult = { importedCount: res.importedCount, duplicateCount: res.duplicateCount, duplicates: res.duplicates };
        this.importSubmitting = false;
        this.loadGuests();
      },
      error: err => { this.importError = err.error?.error || 'Import failed.'; this.importSubmitting = false; }
    });
  }

  downloadGuestList() {
    if (this.exportingCsv) return;
    this.exportingCsv = true;
    this.guestService.exportGuestsCsv(this.eventId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (this.event?.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        a.href = url;
        a.download = `invitely-guests-${safeName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportingCsv = false;
      },
      error: () => {
        alert('Export failed. Please try again.');
        this.exportingCsv = false;
      }
    });
  }
}