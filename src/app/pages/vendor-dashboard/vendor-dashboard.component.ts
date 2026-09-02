import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css']
})
export class VendorDashboardComponent implements OnInit {
  vendor: any = null;
  loading = true;
  sidebarOpen = false;
  showUpgradeModal = false;
  showCertModal = false;
  showMediaModal = false;
  showAddListingModal = false;

  certFiles: File[] = [];
  mediaFiles: File[] = [];
  mediaUploading = false;
  certUploading = false;
  mediaError = '';
  certError = '';

  newListing = { businessName: '', businessCategory: [] as string[], businessCity: '', businessDescription: '', otherCategory: '' };
  addingListing = false;

  stats = { views: 0, enquiries: 0, rating: 0, reviewCount: 0 };

  readonly categories = [
    { id: 'catering',    label: 'Catering'        },
    { id: 'hall',        label: 'Event hall'       },
    { id: 'photography', label: 'Photography'      },
    { id: 'decoration',  label: 'Decoration'       },
    { id: 'dj',          label: 'DJ / Band'        },
    { id: 'mc',          label: 'MC'               },
    { id: 'makeup',      label: 'Makeup artist'    },
    { id: 'fashion',     label: 'Fashion designer' },
    { id: 'cake',        label: 'Cake maker'       },
    { id: 'other',       label: 'Other'            },
  ];

  readonly cities = ['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Kaduna','Benin City','Owerri','Uyo','Other'];

  private API = environment.apiUrl;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void { this.loadProfile(); }

  private jsonHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}`, 'Content-Type': 'application/json' });
  }
  private fileHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void  { this.sidebarOpen = false; }

  loadProfile() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.jsonHeaders() }).subscribe({
      next: user => { this.vendor = user; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  get isPro(): boolean { return this.vendor?.vendorPlan === 'pro'; }

  get categories_list(): string[] {
    if (!this.vendor?.businessCategory) return [];
    return this.vendor.businessCategory.split(',').map((c: string) => c.trim()).filter(Boolean);
  }

  get businessImages(): any[] { return this.vendor?.businessImages || []; }
  get certificates(): any[]   { return this.vendor?.certificates   || []; }
  get additionalListings(): any[] { return this.vendor?.additionalListings || []; }

  onMediaSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.mediaFiles = [...this.mediaFiles, ...files].slice(0, 20);
    this.mediaError = '';
  }

  uploadMedia() {
    if (!this.mediaFiles.length) return;
    this.mediaUploading = true; this.mediaError = '';
    const fd = new FormData();
    this.mediaFiles.forEach(f => fd.append('files', f));
    this.http.post<any>(`${this.API}/users/media`, fd, { headers: this.fileHeaders() }).subscribe({
      next: user => { this.vendor = user; this.mediaFiles = []; this.mediaUploading = false; this.showMediaModal = false; },
      error: err  => { this.mediaError = err.error?.error || 'Upload failed.'; this.mediaUploading = false; }
    });
  }

  deleteMedia(publicId: string) {
    if (!confirm('Remove this image/video?')) return;
    this.http.delete<any>(`${this.API}/users/media/${encodeURIComponent(publicId)}`, { headers: this.jsonHeaders() })
      .subscribe({ next: user => this.vendor = user });
  }

  onCertSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.certFiles = [...this.certFiles, ...files].slice(0, 10);
    this.certError = '';
  }

  uploadCerts() {
    if (!this.certFiles.length) return;
    this.certUploading = true; this.certError = '';
    const fd = new FormData();
    this.certFiles.forEach(f => fd.append('files', f));
    this.http.post<any>(`${this.API}/users/certificates`, fd, { headers: this.fileHeaders() }).subscribe({
      next: user => { this.vendor = user; this.certFiles = []; this.certUploading = false; this.showCertModal = false; },
      error: err  => { this.certError = err.error?.error || 'Upload failed.'; this.certUploading = false; }
    });
  }

  deleteCert(publicId: string) {
    if (!confirm('Remove this certificate?')) return;
    this.http.delete<any>(`${this.API}/users/certificates/${encodeURIComponent(publicId)}`, { headers: this.jsonHeaders() })
      .subscribe({ next: user => this.vendor = user });
  }

  toggleNewCategory(id: string) {
    const idx = this.newListing.businessCategory.indexOf(id);
    if (idx > -1) this.newListing.businessCategory.splice(idx, 1);
    else this.newListing.businessCategory.push(id);
  }

  submitNewListing() {
    if (!this.newListing.businessName || !this.newListing.businessCategory.length || !this.newListing.businessCity) return;
    this.addingListing = true;
    this.http.post<any>(`${this.API}/users/add-listing`, {
      businessName:        this.newListing.businessName,
      businessCategory:    this.newListing.businessCategory.join(','),
      businessCity:        this.newListing.businessCity,
      businessDescription: this.newListing.businessDescription,
    }, { headers: this.jsonHeaders() }).subscribe({
      next: user => {
        this.vendor = user; this.showAddListingModal = false; this.addingListing = false;
        this.newListing = { businessName: '', businessCategory: [], businessCity: '', businessDescription: '', otherCategory: '' };
      },
      error: () => { this.addingListing = false; }
    });
  }

  openPaystack() {
    const handler = (window as any).PaystackPop?.setup({
      key:      'pk_live_YOUR_PAYSTACK_PUBLIC_KEY',
      email:    this.vendor?.email,
      amount:   500000,
      currency: 'NGN',
      ref:      `VND-${this.vendor?._id}-${Date.now()}`,
      metadata: { vendorId: this.vendor?._id, plan: 'pro' },
      callback: (response: any) => this.verifyPayment(response.reference),
      onClose:  () => {}
    });
    handler?.openIframe();
  }

  verifyPayment(reference: string) {
    this.http.post<any>(`${this.API}/vendors/upgrade`, { reference, vendorId: this.vendor._id }, { headers: this.jsonHeaders() }).subscribe({
      next: () => { this.vendor = { ...this.vendor, vendorPlan: 'pro' }; this.showUpgradeModal = false; },
      error: () => alert('Payment verification failed. Contact support.')
    });
  }

  logout() { this.auth.logout(); }
  isVideo(url: string): boolean { return /\.(mp4|mov|avi|webm|mkv)/i.test(url); }
}