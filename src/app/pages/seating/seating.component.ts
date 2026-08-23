import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { GuestService } from '../../core/services/guest.service';
import { Event, Table, Seat } from '../../core/models/event.model';
import { Guest } from '../../core/models/guest.model';

@Component({
  selector: 'app-seating',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './seating.component.html',
  styleUrls: ['./seating.component.css']
})
export class SeatingComponent implements OnInit {
  eventId = '';
  event!: Event;
  guests: Guest[] = [];
  loading = true;
  saving = false;
  saved = false;
  dragGuest: Guest | null = null;

  newTable = { shape: 'round' as 'round' | 'rectangular', capacity: 10, label: '' };

  // Expose Math to template
  readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private guestService: GuestService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getOne(this.eventId).subscribe(e => {
      this.event = e;
      if (!this.event.tables) this.event.tables = [];
      this.loading = false;
    });
    this.guestService.getAll(this.eventId).subscribe(g => this.guests = g);
  }

  get tablesExist(): boolean {
    return !!(this.event?.tables && this.event.tables.length > 0);
  }

  get unassignedGuests() {
    const assigned = new Set(
      this.event?.tables?.flatMap(t => t.seats.map(s => s.guestId)).filter(Boolean)
    );
    return this.guests.filter(g => !assigned.has(g._id));
  }

  addTable() {
    if (!this.event.tables) this.event.tables = [];
    const num = this.event.tables.length + 1;
    const seats: Seat[] = Array.from({ length: this.newTable.capacity }, (_, i) => ({
      seatNumber: i + 1, guestId: undefined, guestName: ''
    }));
    this.event.tables.push({
      tableNumber: num,
      label: this.newTable.label || `Table ${num}`,
      shape: this.newTable.shape,
      capacity: this.newTable.capacity,
      seats
    });
    this.newTable = { shape: 'round', capacity: 10, label: '' };
  }

  removeTable(idx: number) {
    if (!confirm('Remove this table?')) return;
    this.event.tables.splice(idx, 1);
  }

  clearSeat(seat: Seat) {
    seat.guestId = undefined;
    seat.guestName = '';
  }

  onDragStart(guest: Guest) { this.dragGuest = guest; }

  onDropSeat(seat: Seat) {
    if (this.dragGuest && !seat.guestId) {
      this.event.tables.forEach(t => t.seats.forEach(s => {
        if (s.guestId === this.dragGuest!._id) { s.guestId = undefined; s.guestName = ''; }
      }));
      seat.guestId = this.dragGuest._id;
      seat.guestName = this.dragGuest.name;
    }
    this.dragGuest = null;
  }

  getTopSeats(table: Table): Seat[] {
    return table.seats.slice(0, Math.ceil(table.seats.length / 2));
  }

  getBottomSeats(table: Table): Seat[] {
    return table.seats.slice(Math.ceil(table.seats.length / 2));
  }

  getSeatX(index: number, total: number, radius: number): number {
    const angle = ((360 / total) * index - 90) * (Math.PI / 180);
    return radius + radius * Math.cos(angle);
  }

  getSeatY(index: number, total: number, radius: number): number {
    const angle = ((360 / total) * index - 90) * (Math.PI / 180);
    return radius + radius * Math.sin(angle);
  }

  save() {
    this.saving = true;
    this.eventService.saveSeating(this.eventId, this.event.tables).subscribe({
      next: () => { this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 2500); },
      error: () => this.saving = false
    });
  }

  getGuestInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}