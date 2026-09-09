import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Event } from '../../core/models/event.model';


type EventType =
  | 'wedding'
  | 'birthday'
  | 'conference'
  | 'owambe'
  | 'traditional'
  | 'other';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  events: Event[] = [];
  selectedEventId = '';
  loading = true;
  showNewModal = false;
  creating = false;
  createError = '';
  dashTab = 'events';
  showNotifications = false;
  momentsLoading = false;
  recentMoments: any[] = [];
  sidebarOpen = false;

  readonly loadingSkeletons = [1, 2, 3];
  readonly momentSkeletons = [1, 2, 3, 4, 5, 6];

  newEvent: {
    type: EventType; title: string; coupleNames: string;
    date: string; time: string; venue: string; venueAddress: string;
  } = { type: 'wedding', title: '', coupleNames: '', date: '', time: '', venue: '', venueAddress: '' };

  readonly eventTypes: { id: EventType; label: string }[] = [
    { id: 'wedding',     label: 'Wedding'     },
    { id: 'birthday',    label: 'Birthday'    },
    { id: 'conference',  label: 'Conference'  },
    { id: 'owambe',      label: 'Owambe'      },
    { id: 'traditional', label: 'Traditional' },
    { id: 'other',       label: 'Other'       },
  ];

  readonly quickVendorCats = [
    { id: 'catering',    label: 'Catering'    },
    { id: 'hall',        label: 'Event halls' },
    { id: 'photography', label: 'Photography' },
    { id: 'decoration',  label: 'Decoration'  },
    { id: 'dj',          label: 'DJ / Band'   },
    { id: 'makeup',      label: 'Makeup'      },
  ];

  constructor(
    public auth: AuthService,
    private eventService: EventService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (events: Event[]) => { this.events = events || []; this.loading = false; },
      error: () => { this.events = []; this.loading = false; }
    });
  }

  @HostListener('document:click')
  onDocClick(): void { this.showNotifications = false; }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.notificationService.markAllRead();
  }

  openNotification(link: string): void {
    this.showNotifications = false;
    if (link) this.router.navigateByUrl(link);
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }

  get upcomingEvents(): Event[] {
    const now = new Date();
    return this.events
      .filter(e => new Date(e.date).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  get pastEvents(): Event[] {
    const now = new Date();
    return this.events
      .filter(e => new Date(e.date).getTime() < now.getTime())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  daysUntil(date: string | Date): number {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
  }

  openEvent(id: string): void { this.router.navigate(['/event', id, 'builder']); }
  selectType(type: EventType): void { this.newEvent.type = type; }

  loadMoments(): void {
    if (this.momentsLoading) return;
    this.momentsLoading = true;
    setTimeout(() => { this.recentMoments = []; this.momentsLoading = false; }, 500);
  }

  openMomentFull(): void { this.router.navigate(['/moments']); }
  clearNotifications(): void { this.notificationService.clearAll(); this.showNotifications = false; }

  createEvent(): void {
    if (!this.newEvent.title.trim() || !this.newEvent.date || !this.newEvent.venue.trim()) {
      this.createError = 'Title, date and venue are required.'; return;
    }
    this.creating = true; this.createError = '';
    const payload = {
      type: this.newEvent.type, title: this.newEvent.title.trim(),
      coupleNames: this.newEvent.coupleNames.trim(), date: this.newEvent.date,
      time: this.newEvent.time, venue: this.newEvent.venue.trim(),
      venueAddress: this.newEvent.venueAddress.trim()
    };
    this.eventService.create(payload).subscribe({
      next: (event: Event) => {
        this.creating = false; this.showNewModal = false; this.resetNewEvent();
        if (event?._id) this.router.navigate(['/event', event._id, 'builder']);
      },
      error: (err) => {
        this.createError = err?.error?.error || 'Failed to create event. Please try again.';
        this.creating = false;
      }
    });
  }

  resetNewEvent(): void {
    this.newEvent = { type: 'wedding', title: '', coupleNames: '', date: '', time: '', venue: '', venueAddress: '' };
    this.createError = '';
  }

  closeNewModal(): void { if (this.creating) return; this.showNewModal = false; this.resetNewEvent(); }

  getThemeGradient(event: Event): string {
    if (event.theme === 'custom' && event.customBgColor) return event.customBgColor;
    const map: Record<string, string> = {
      ivory: 'linear-gradient(135deg,#F8F3E8,#E8DFD0)', gold: 'linear-gradient(135deg,#2A1F0E,#4A3520)',
      lavender: 'linear-gradient(135deg,#E8E0F0,#D4C8E8)', emerald: 'linear-gradient(135deg,#0D2B20,#1A4A35)',
      rose: 'linear-gradient(135deg,#F0E0E5,#E0C5CE)', navy: 'linear-gradient(135deg,#0A1628,#1A2D4A)',
      blush: 'linear-gradient(135deg,#FDE8EE,#F5C0CE)', terracotta: 'linear-gradient(135deg,#3D1A0A,#5A2810)',
      sage: 'linear-gradient(135deg,#F0F5EE,#D8E8D4)', champagne: 'linear-gradient(135deg,#2A200E,#3D3010)',
      plum: 'linear-gradient(135deg,#1A0A1E,#2E1040)', 'ivory-dark': 'linear-gradient(135deg,#1A1510,#2A2018)',
    };
    return map[event.theme || 'ivory'] || map['ivory'];
  }

  getThemeColor(theme: string): string {
    return ['gold','emerald','navy','terracotta','champagne','plum','ivory-dark'].includes(theme)
      ? '#F5E6C4' : '#3D2E1A';
  }

  logout(): void { this.auth.logout(); }
}