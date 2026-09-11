import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { PLATFORM_ID, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

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
    { icon: '✦', title: 'Fully customisable', desc: 'Themes, fonts, languages, colours — every element matches your vision exactly.' },
    { icon: '◈', title: 'Secure QR entry', desc: 'Each guest gets a unique, non-transferable QR code. Scanned at the door — no duplicates possible.' },
    { icon: '◎', title: 'Route to venue', desc: "Auto-generates turn-by-turn directions from each guest's live location via Google Maps." },
    { icon: '◇', title: 'Asoebi payments', desc: 'Guests order and pay for asoebi directly from their personal invite — no chasing.' },
    { icon: '▣', title: 'Visual seating', desc: 'Drag-and-drop tables and seats. Guests see their exact position, like an O2 Arena ticket.' },
    { icon: '◉', title: 'WhatsApp delivery', desc: 'Send invitations directly to guests via WhatsApp, SMS, or email in one click.' },
    { icon: '◷', title: 'Countdown & reminders', desc: 'Live countdown on every invite plus guest-set alarm reminders so no one forgets.' },
    { icon: '◈', title: 'Vendor marketplace', desc: 'Discover and book caterers, halls, photographers and more — all in one place.' },
    { icon: '◎', title: 'Moments feed', desc: 'Couples share photos from their journey — guests follow along in an Instagram-style feed.' },
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

  readonly eventCategories = [
    { label: 'Weddings', slug: 'wedding' },
    { label: 'Birthdays', slug: 'birthday' },
    { label: 'Conferences', slug: 'conference' },
    { label: 'Owambe', slug: 'owambe' },
    { label: 'Traditional', slug: 'traditional' },
  ];

  get currentYear(): number { return new Date().getFullYear(); }

  private platformId = inject(PLATFORM_ID);
  private intervalId: any;

  constructor(
    public themeService: ThemeService,
    private auth: AuthService,
    private router: Router,
    private seo: SeoService

  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.themeService.startRotation();
    this.intervalId = setInterval(() => {
      this.activeThemeId = this.themeService.current().id;
    }, 500);

    this.seo.setJsonLd('org-schema', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Innvitely',
      url: environment.siteUrl,
      description: 'Digital invitations platform for weddings, birthdays and owambe celebrations.',
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.themeService.stopRotation();
  }

  setTheme(id: string) {
    this.activeThemeId = id;
    this.themeService.setTheme(id);
  }

  navWithAuth(path: string) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([path]);
    } else {
      const returnUrl = path.startsWith('/') ? path.slice(1) : path;
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    }
  }

  goToEventCategory(slug: string) { this.navWithAuth('/moments/' + slug); }
  goToCreateEvent() { this.navWithAuth('/dashboard'); }
  goToVendors() { this.navWithAuth('/vendors'); }

  @HostListener('window:scroll')
  onScroll() { this.showBackToTop = window.scrollY > 500; }

  scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}