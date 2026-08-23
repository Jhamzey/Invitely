import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { Vendor } from '../../../core/models/vendor.model';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.css']
})
export class VendorDetailComponent implements OnInit {
  vendor!: Vendor;
  loading = true;
  selectedImage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.vendorService.getById(id).subscribe({
      next: v => { this.vendor = v; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/vendors']); }
    });
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

  contact() {
    if (!this.vendor.phone) return;
    const msg = encodeURIComponent(
      `Hi ${this.vendor.name}! I found you on Invitely and I'd like to enquire about your ${this.vendor.category} services for my event.`
    );
    window.open(`https://wa.me/${this.vendor.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  }
}