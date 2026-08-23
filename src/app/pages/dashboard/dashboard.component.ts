import {
  Component,
  OnInit,
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
export class DashboardComponent implements OnInit {

  // ============================================================
  // DATA
  // ============================================================

  events: Event[] = [];

  loading = true;

  showNewModal = false;

  creating = false;

  createError = '';

  dashTab = 'events';

  showNotifications = false;

  momentsLoading = false;

  recentMoments: any[] = [];


  // Skeleton arrays
  readonly loadingSkeletons = [1, 2, 3];

  readonly momentSkeletons = [1, 2, 3, 4, 5, 6];


  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  notifications = [
    {
      icon: '✅',
      text: "Zainab Okafor has RSVP'd attending",
      time: '2 min ago'
    },
    {
      icon: '🔐',
      text: 'Tunde Nwosu arrived — QR scanned',
      time: '15 min ago'
    },
    {
      icon: '💃',
      text: 'New asoebi order from Fatima Cole',
      time: '1 hr ago'
    }
  ];


  // ============================================================
  // NEW EVENT
  // ============================================================

  newEvent: {
    type: EventType;
    title: string;
    coupleNames: string;
    date: string;
    time: string;
    venue: string;
    venueAddress: string;
  } = {
    type: 'wedding',
    title: '',
    coupleNames: '',
    date: '',
    time: '',
    venue: '',
    venueAddress: ''
  };


  // ============================================================
  // EVENT TYPES
  // ============================================================

  readonly eventTypes: {
    id: EventType;
    icon: string;
    label: string;
  }[] = [
    {
      id: 'wedding',
      icon: '💍',
      label: 'Wedding'
    },
    {
      id: 'birthday',
      icon: '🎂',
      label: 'Birthday'
    },
    {
      id: 'conference',
      icon: '🎤',
      label: 'Conference'
    },
    {
      id: 'owambe',
      icon: '💃',
      label: 'Owambe'
    },
    {
      id: 'traditional',
      icon: '👘',
      label: 'Traditional'
    },
    {
      id: 'other',
      icon: '🎉',
      label: 'Other'
    }
  ];


  // ============================================================
  // QUICK VENDOR CATEGORIES
  // ============================================================

  readonly quickVendorCats = [
    {
      id: 'catering',
      icon: '🍽️',
      label: 'Catering'
    },
    {
      id: 'hall',
      icon: '🏛️',
      label: 'Event halls'
    },
    {
      id: 'photography',
      icon: '📸',
      label: 'Photography'
    },
    {
      id: 'decoration',
      icon: '🎀',
      label: 'Decoration'
    },
    {
      id: 'dj',
      icon: '🎵',
      label: 'DJ / Band'
    },
    {
      id: 'makeup',
      icon: '💄',
      label: 'Makeup'
    }
  ];


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    public auth: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.loadEvents();

  }


  // ============================================================
  // LOAD EVENTS
  // ============================================================

  loadEvents(): void {

    this.loading = true;

    this.eventService.getAll().subscribe({

      next: (events: Event[]) => {

        this.events = events || [];

        this.loading = false;

      },

      error: (error) => {

        console.error('Failed to load events:', error);

        this.events = [];

        this.loading = false;

      }

    });

  }


  // ============================================================
  // CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
  // ============================================================

  @HostListener('document:click')
  onDocClick(): void {

    this.showNotifications = false;

  }


  // ============================================================
  // TOGGLE NOTIFICATIONS
  // ============================================================

  toggleNotifications(event: MouseEvent): void {

    event.stopPropagation();

    this.showNotifications = !this.showNotifications;

  }


  // ============================================================
  // UPCOMING EVENTS
  // ============================================================

  get upcomingEvents(): Event[] {

    const now = new Date();

    return this.events

      .filter(event => {

        return new Date(event.date).getTime() >= now.getTime();

      })

      .sort((a, b) => {

        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );

      });

  }


  // ============================================================
  // PAST EVENTS
  // ============================================================

  get pastEvents(): Event[] {

    const now = new Date();

    return this.events

      .filter(event => {

        return new Date(event.date).getTime() < now.getTime();

      })

      .sort((a, b) => {

        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );

      });

  }


  // ============================================================
  // DAYS UNTIL EVENT
  // ============================================================

  daysUntil(date: string | Date): number {

    const eventDate = new Date(date);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    eventDate.setHours(0, 0, 0, 0);

    const difference =
      eventDate.getTime() -
      today.getTime();

    return Math.ceil(
      difference / 86400000
    );

  }


  // ============================================================
  // OPEN EVENT
  // ============================================================

  openEvent(id: string): void {

    this.router.navigate([
      '/event',
      id,
      'builder'
    ]);

  }


  // ============================================================
  // EVENT TYPE
  // ============================================================

  selectType(type: EventType): void {

    this.newEvent.type = type;

  }


  // ============================================================
  // MOMENTS
  // ============================================================

  loadMoments(): void {

    if (this.momentsLoading) {
      return;
    }

    this.momentsLoading = true;

    // Placeholder until Moments API is connected.
    setTimeout(() => {

      this.recentMoments = [];

      this.momentsLoading = false;

    }, 500);

  }


  openMomentFull(): void {

    this.router.navigate(['/moments']);

  }


  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  clearNotifications(): void {

    this.notifications = [];

    this.showNotifications = false;

  }


  // ============================================================
  // CREATE EVENT
  // ============================================================

  createEvent(): void {

    if (
      !this.newEvent.title.trim() ||
      !this.newEvent.date ||
      !this.newEvent.venue.trim()
    ) {

      this.createError =
        'Title, date and venue are required.';

      return;

    }


    this.creating = true;

    this.createError = '';


    const payload = {
      type: this.newEvent.type,
      title: this.newEvent.title.trim(),
      coupleNames: this.newEvent.coupleNames.trim(),
      date: this.newEvent.date,
      time: this.newEvent.time,
      venue: this.newEvent.venue.trim(),
      venueAddress: this.newEvent.venueAddress.trim()
    };


    this.eventService.create(payload).subscribe({

      next: (event: Event) => {

        this.creating = false;

        this.showNewModal = false;

        this.resetNewEvent();

        if (event?._id) {

          this.router.navigate([
            '/event',
            event._id,
            'builder'
          ]);

        }

      },

      error: (err) => {

        console.error(
          'Failed to create event:',
          err
        );

        this.createError =
          err?.error?.error ||
          'Failed to create event. Please try again.';

        this.creating = false;

      }

    });

  }


  // ============================================================
  // RESET NEW EVENT
  // ============================================================

  resetNewEvent(): void {

    this.newEvent = {
      type: 'wedding',
      title: '',
      coupleNames: '',
      date: '',
      time: '',
      venue: '',
      venueAddress: ''
    };

    this.createError = '';

  }


  // ============================================================
  // CLOSE MODAL
  // ============================================================

  closeNewModal(): void {

    if (this.creating) {
      return;
    }

    this.showNewModal = false;

    this.resetNewEvent();

  }


  // ============================================================
  // THEME GRADIENT
  // ============================================================

  getThemeGradient(event: Event): string {

    if (
      event.theme === 'custom' &&
      event.customBgColor
    ) {

      return event.customBgColor;

    }


    const map: Record<string, string> = {

      ivory:
        'linear-gradient(135deg,#F8F3E8,#E8DFD0)',

      gold:
        'linear-gradient(135deg,#2A1F0E,#4A3520)',

      lavender:
        'linear-gradient(135deg,#E8E0F0,#D4C8E8)',

      emerald:
        'linear-gradient(135deg,#0D2B20,#1A4A35)',

      rose:
        'linear-gradient(135deg,#F0E0E5,#E0C5CE)',

      navy:
        'linear-gradient(135deg,#0A1628,#1A2D4A)',

      blush:
        'linear-gradient(135deg,#FDE8EE,#F5C0CE)',

      terracotta:
        'linear-gradient(135deg,#3D1A0A,#5A2810)',

      sage:
        'linear-gradient(135deg,#F0F5EE,#D8E8D4)',

      champagne:
        'linear-gradient(135deg,#2A200E,#3D3010)',

      plum:
        'linear-gradient(135deg,#1A0A1E,#2E1040)',

      'ivory-dark':
        'linear-gradient(135deg,#1A1510,#2A2018)'

    };


    return (
      map[event.theme || 'ivory'] ||
      map['ivory']
    );

  }


  // ============================================================
  // THEME TEXT COLOR
  // ============================================================

  getThemeColor(theme: string): string {

    const darkThemes = [
      'gold',
      'emerald',
      'navy',
      'terracotta',
      'champagne',
      'plum',
      'ivory-dark'
    ];


    return darkThemes.includes(theme)
      ? '#F5E6C4'
      : '#3D2E1A';

  }


  // ============================================================
  // LOGOUT
  // ============================================================

  logout(): void {

    this.auth.logout();

  }

}