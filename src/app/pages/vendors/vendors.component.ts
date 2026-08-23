import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor } from '../../core/models/vendor.model';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.css']
})
export class VendorsComponent implements OnInit {
  vendors: Vendor[] = [];
  loading = true;
  search = '';
  category = 'all';
  city = '';
  selectedVendor: Vendor | null = null;

  readonly categories = [
    { id: 'all', label: 'All', icon: '✦' },
    { id: 'catering', label: 'Catering', icon: '🍽️' },
    { id: 'hall', label: 'Event halls', icon: '🏛️' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'decoration', label: 'Decoration', icon: '🎀' },
    { id: 'dj', label: 'DJ / Band', icon: '🎵' },
    { id: 'mc', label: 'MC', icon: '🎤' },
    { id: 'makeup', label: 'Makeup', icon: '💄' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'cake', label: 'Cake', icon: '🎂' },
  ];

  readonly cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'];

  constructor(private vendorService: VendorService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.vendorService.getAll({ category: this.category, city: this.city, q: this.search }).subscribe({
      next: v => { this.vendors = v; this.loading = false; },
      error: () => this.loading = false
    });
  }

  setCategory(id: string) { this.category = id; this.load(); }
  setCity(c: string) { this.city = this.city === c ? '' : c; this.load(); }

  getCategoryIcon(cat: string): string {
    return this.categories.find(c => c.id === cat)?.icon || '🔗';
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  contact(v: Vendor) {
    if (v.phone) {
      const msg = encodeURIComponent(`Hi! I found you on Invitely and I'd like to enquire about your ${v.category} services for my event.`);
      window.open(`https://wa.me/${v.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    }
  }
}