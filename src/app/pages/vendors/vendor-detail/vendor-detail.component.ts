import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { AuthService } from '../../../core/services/auth.service';
import { Vendor } from '../../../core/models/vendor.model';
import { Review } from '../../../core/models/review.model';
import { ContactDisclaimerComponent } from '../../../shared/contact-disclaimer/contact-disclaimer.component';

const DISMISS_KEY = 'invitely_contact_disclaimer_dismissed';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ContactDisclaimerComponent],
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.css']
})
export class VendorDetailComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  vendor!: Vendor;
  loading = true;
  selectedImage = 0;

  showDisclaimer = false;
  pendingMethod: 'whatsapp' | 'call' | null = null;

  reviews: Review[] = [];
  reviewsLoading = true;
  myRating = 0;
  myComment = '';
  submittingReview = false;
  reviewError = '';

  isFavorite = false;
  favoriteBusy = false;

  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.vendorService.getById(id).subscribe({
      next: v => { this.vendor = v; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/vendors']); }
    });
    this.vendorService.getReviews(id).subscribe({
      next: r => { this.reviews = r; this.reviewsLoading = false; },
      error: () => { this.reviewsLoading = false; }
    });
    if (this.isLoggedIn) {
      this.vendorService.getFavorites().subscribe({
        next: favs => { this.isFavorite = favs.some(f => f._id === id); }
      });
    }
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      catering: '🍽️', hall: '🏛️', photography: '📸',
      decoration: '🎀', dj: '🎵', mc: '🎤',
      makeup: '💄', fashion: '👗', cake: '🎂', other: '🔗'
    };
    return icons[cat] || '🔗';
  }

  requestContact(method: 'whatsapp' | 'call') {
    if (!this.vendor.phone) return;
    if (this.isBrowser && localStorage.getItem(DISMISS_KEY) === 'true') {
      this.openContact(method);
      return;
    }
    this.pendingMethod = method;
    this.showDisclaimer = true;
  }

  confirmContact(dontShowAgain: boolean) {
    if (dontShowAgain && this.isBrowser) localStorage.setItem(DISMISS_KEY, 'true');
    if (this.pendingMethod) this.openContact(this.pendingMethod);
    this.showDisclaimer = false;
    this.pendingMethod = null;
  }

  cancelContact() {
    this.showDisclaimer = false;
    this.pendingMethod = null;
  }

  private openContact(method: 'whatsapp' | 'call') {
    if (!this.isBrowser || !this.vendor.phone) return;
    const digits = this.vendor.phone.replace(/\D/g, '');
    if (method === 'call') {
      window.location.href = `tel:+${digits}`;
    } else {
      const msg = encodeURIComponent(
        `Hi ${this.vendor.name}! I found you on Innvitely and I'd like to enquire about your ${this.vendor.category} services for my event.`
      );
      window.open(`https://wa.me/${digits}?text=${msg}`, '_blank');
    }
  }

  setMyRating(n: number) { this.myRating = n; }

  submitReview() {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    if (this.myRating < 1) { this.reviewError = 'Please choose a star rating.'; return; }
    this.reviewError = '';
    this.submittingReview = true;
    const id = this.route.snapshot.paramMap.get('id')!;
    this.vendorService.submitReview(id, { rating: this.myRating, comment: this.myComment }).subscribe({
      next: res => {
        this.vendor.rating = res.rating;
        this.vendor.reviewCount = res.reviewCount;
        this.submittingReview = false;
        this.myRating = 0;
        this.myComment = '';
        this.vendorService.getReviews(id).subscribe(r => this.reviews = r);
      },
      error: err => {
        this.reviewError = err.error?.error || 'Could not submit your review.';
        this.submittingReview = false;
      }
    });
  }

  toggleFavorite() {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.favoriteBusy = true;
    const id = this.route.snapshot.paramMap.get('id')!;
    const call = this.isFavorite ? this.vendorService.removeFavorite(id) : this.vendorService.addFavorite(id);
    call.subscribe({
      next: () => { this.isFavorite = !this.isFavorite; this.favoriteBusy = false; },
      error: () => { this.favoriteBusy = false; }
    });
  }
}