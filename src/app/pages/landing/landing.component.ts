import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  showBackToTop = false;
  activeThemeId = 'ivory';
  mobileMenuOpen = false;

  readonly features = [
    { icon: '🎨', title: 'Fully customisable', desc: 'Themes, fonts, languages, colours — every element matches your vision exactly.' },
    { icon: '🔐', title: 'Secure QR entry', desc: 'Each guest gets a unique, non-transferable QR code. Scanned at the door — no duplicates possible.' },
    { icon: '📍', title: 'Route to venue', desc: "Auto-generates turn-by-turn directions from each guest's live location via Google Map." },
    { icon: '💃', title: 'Asoebi payments', desc: 'Guests order and pay for asoebi directly from their personal invite — no chasing.' },
    { icon: '🪑', title: 'Visual seating', desc: 'Drag-and-drop tables and seats. Guests see their exact position, like an O2 Arena ticket.' },
    { icon: '📱', title: 'WhatsApp delivery', desc: 'Send invitations directly to guests via WhatsApp, SMS, or email in one click.' },
    { icon: '⏰', title: 'Countdown & reminders', desc: 'Live countdown on every invite plus guest-set alarm reminders so no one forgets.' },
    { icon: '🍽️', title: 'Vendor marketplace', desc: 'Discover and book caterers, halls, photographers and more — all in one place.' },
    { icon: '📸', title: 'Moments feed', desc: 'Couples share photos from their journey — guests follow along in a private Instagram-style feed.' },
  ];

  readonly plans = [
    {
      name: 'Starter', price: 'Free', per: 'Up to 50 guests',
      features: ['1 event at a time', 'All themes & fonts', 'QR entry codes', 'WhatsApp delivery', 'Basic seating plan'],
      cta: 'Start free', featured: false
    },
    {
      name: 'Standard', price: '₦15,000', per: 'per event · up to 500 guests',
      features: ['Everything in Starter', 'Visual seating chart', 'Asoebi payments', 'Vendor marketplace access', 'RSVP dashboard', 'Meal choice tracking', 'Moments photo feed'],
      cta: 'Get Standard', featured: true
    },
    {
      name: 'Premium', price: '₦35,000', per: 'per event · unlimited guests',
      features: ['Everything in Standard', 'Multi-language invites', 'Custom invite link domain', 'Priority WhatsApp support', 'Full analytics & export', 'Dedicated host support'],
      cta: 'Get Premium', featured: false
    }
  ];

  readonly testimonials = [
    { name: 'Amara & Emeka', event: 'Wedding · Lagos', quote: 'Our guests couldn\'t stop talking about how beautiful the invite was. The QR entry at the gate made everything so smooth.', avatar: 'A' },
    { name: 'Bimpe Adeleke', event: 'Birthday · Abuja', quote: 'I organised my mum\'s 60th from London. Set everything up in an evening, sent 200 invites via WhatsApp. Incredible.', avatar: 'B' },
    { name: 'TechFest Nigeria', event: 'Conference · Lagos', quote: 'The scan-at-entry feature alone was worth every kobo. Zero queue issues, zero gate crashers.', avatar: 'T' },
  ];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.startRotation();
    setInterval(() => {
      this.activeThemeId = this.themeService.current().id;
    }, 500);
  }

  ngOnDestroy() {
    this.themeService.stopRotation();
    // Reset to default
    this.themeService.applyTheme(this.themeService.themes[0]);
  }

  setTheme(id: string) {
    this.activeThemeId = id;
    this.themeService.setTheme(id);
  }

  @HostListener('window:scroll')
  onScroll() { this.showBackToTop = window.scrollY > 500; }

  scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}