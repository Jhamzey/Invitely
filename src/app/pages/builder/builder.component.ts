import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { MapPickerComponent } from '../../shared/map-picker/map-picker.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, MapPickerComponent],
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
  eventId = '';
  event!: Event;
  loading = true;
  saving = false;
  saved = false;
  activeTab = 'design';
  coverFile: File | null = null;
  coverPreview = '';
  showMapPicker = false;
  showMobilePreview = false;
  showInvitePreview = false;

  readonly templates = [
    { id: 'ivory', label: 'Ivory Classic', bg: 'linear-gradient(135deg,#F8F3E8,#E8DFD0)', color: '#3D2E1A', preview: '🤍' },
    { id: 'gold', label: 'Golden Hour', bg: 'linear-gradient(135deg,#2A1F0E,#4A3520)', color: '#F5E6C4', preview: '✨' },
    { id: 'lavender', label: 'Lavender Dreams', bg: 'linear-gradient(135deg,#E8E0F0,#D4C8E8)', color: '#2D1F45', preview: '💜' },
    { id: 'emerald', label: 'Emerald Garden', bg: 'linear-gradient(135deg,#0D2B20,#1A4A35)', color: '#D4EDE4', preview: '🌿' },
    { id: 'rose', label: 'Rose Romance', bg: 'linear-gradient(135deg,#F0E0E5,#E0C5CE)', color: '#3D1020', preview: '🌹' },
    { id: 'navy', label: 'Midnight Navy', bg: 'linear-gradient(135deg,#0A1628,#1A2D4A)', color: '#C5D8F0', preview: '🌙' },
    { id: 'blush', label: 'Blush Garden', bg: 'linear-gradient(135deg,#FDE8EE,#F5C0CE)', color: '#4A1020', preview: '🌸' },
    { id: 'terracotta', label: 'Terracotta Sun', bg: 'linear-gradient(135deg,#3D1A0A,#5A2810)', color: '#F5D4B8', preview: '🏺' },
    { id: 'sage', label: 'Sage Forest', bg: 'linear-gradient(135deg,#F0F5EE,#D8E8D4)', color: '#1A3020', preview: '🍃' },
    { id: 'champagne', label: 'Champagne Glow', bg: 'linear-gradient(135deg,#2A200E,#3D3010)', color: '#F0DFA8', preview: '🥂' },
    { id: 'plum', label: 'Royal Plum', bg: 'linear-gradient(135deg,#1A0A1E,#2E1040)', color: '#E8D0F0', preview: '👑' },
    { id: 'ivory-dark', label: 'Dark Ivory', bg: 'linear-gradient(135deg,#1A1510,#2A2018)', color: '#F5EDE0', preview: '🕯️' },
  ];

  readonly colorPresets = [
    '#C9A84C', '#C4546A', '#2E6B5E', '#1A3A5C', '#6B4F8C',
    '#C4682A', '#5A7A5A', '#D4707E', '#B8956A', '#1A1208',
    '#5C2A5A', '#1A6B6B', '#8B7355', '#4A7FC0', '#C4546A',
  ];

  readonly fonts = [
    { id: 'Cormorant Garamond', label: 'Cormorant (Elegant)' },
    { id: 'Georgia', label: 'Georgia (Classic)' },
    { id: 'Playfair Display', label: 'Playfair (Romantic)' },
    { id: 'Inter', label: 'Inter (Modern)' },
  ];

  readonly languages = ['EN', 'YO', 'IG', 'HA', 'FR', 'PID'];

  readonly tabs = [
    { id: 'design', label: '🎨 Design' },
    { id: 'details', label: '📋 Details' },
    { id: 'asoebi', label: '💃 Asoebi' },
    { id: 'meals', label: '🍽️ Meals' },
  ];

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

  // Custom color mixing
  customBgColor = '#F8F3E8';
  customTextColor = '#3D2E1A';
  customAccentColor = '#C9A84C';

  newAsoebi = { name: '', price: 0, description: '' };
  newMeal = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getOne(this.eventId).subscribe({
      next: event => {
        this.event = event;
        // If it was a custom theme, restore colors
        if (event.theme === 'custom') {
          this.customBgColor =
            event.customBgColor || '#F8F3E8';

          this.customTextColor =
            event.customTextColor || '#3D2E1A';

          this.customAccentColor =
            event.accentColor || '#C9A84C';
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Get preview bg for the live card — handles ALL templates + custom
  get previewBg(): string {
    if (this.event?.theme === 'custom') {
      return this.customBgColor;
    }
    return this.templates.find(t => t.id === this.event?.theme)?.bg || this.templates[0].bg;
  }

  get previewColor(): string {
    if (this.event?.theme === 'custom') {
      return this.customTextColor;
    }
    return this.templates.find(t => t.id === this.event?.theme)?.color || this.templates[0].color;
  }

  setTheme(id: string) {
    this.event.theme = id;
    // Sync accent color with template
    const t = this.templates.find(x => x.id === id);
    if (t) this.event.accentColor = this.colorPresets[0];
  }

  applyCustomColors() {
    this.event.theme = 'custom';
    this.event.accentColor = this.customAccentColor;
    // Store custom colors on event so they persist
    this.event.customBgColor = this.customBgColor;
    this.event.customTextColor = this.customTextColor;
  }

  onCoverSelected(e: any) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = r => this.coverPreview = r.target?.result as string;
    reader.readAsDataURL(file);
  }

  onLocationSelected(loc: { address: string; lat: number; lng: number }) {
    this.event.venueAddress = loc.address;
    this.event.venueLat = loc.lat;
    this.event.venueLng = loc.lng;
    this.showMapPicker = false;
  }

  addAsoebi() {
    if (!this.newAsoebi.name || !this.newAsoebi.price) return;
    this.event.asoebi = [...(this.event.asoebi || []), { ...this.newAsoebi }];
    this.newAsoebi = { name: '', price: 0, description: '' };
  }

  removeAsoebi(i: number) {
    this.event.asoebi = this.event.asoebi.filter((_, idx) => idx !== i);
  }

  addMeal() {
    if (!this.newMeal.trim()) return;
    this.event.meals = [...(this.event.meals || []), { name: this.newMeal.trim() }];
    this.newMeal = '';
  }

  removeMeal(i: number) {
    this.event.meals = this.event.meals.filter((_, idx) => idx !== i);
  }

  save() {
    this.saving = true;
    const payload = {
      ...this.event,
      customBgColor: this.customBgColor,
      customTextColor: this.customTextColor,
    };
    this.eventService.update(this.eventId, payload).subscribe({
      next: updated => {
        this.event = updated;
        this.saving = false;
        this.saved = true;
        if (this.coverFile) {
          this.eventService.uploadCover(this.eventId, this.coverFile).subscribe({
            next: e => { this.event = e; this.coverFile = null; }
          });
        }
        setTimeout(() => this.saved = false, 2500);
      },
      error: () => this.saving = false
    });
  }

  publish() {
    this.event.published = true;
    this.save();
  }

  setStatus(status: string) {
    if (status === 'cancelled' && !confirm('Cancel this event? Guests will see it has been cancelled.')) return;
    if (status === 'suspended' && !confirm('Suspend this invitation? Guests will not be able to access it until you resume it.')) return;
    this.eventService.updateStatus(this.eventId, status).subscribe({
      next: updated => { this.event.status = updated.status; this.event.published = updated.published; }
    });
  }

  goToGuests() { this.router.navigate(['/event', this.eventId, 'guests']); }
  goToSeating() { this.router.navigate(['/event', this.eventId, 'seating']); }
  goToMoments() { this.router.navigate(['/event', this.eventId, 'moments']); }
  goToScan() { this.router.navigate(['/event', this.eventId, 'scan']); }
  goToCollaborate() { this.router.navigate(['/event', this.eventId, 'collaborate']); }
}