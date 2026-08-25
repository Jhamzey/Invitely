import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

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
  showUpgradeModal = false;
  showCertModal = false;
  showMediaModal = false;

  certFiles: File[] = [];
  mediaFiles: File[] = [];
  mediaUploading = false;
  certUploading = false;
  uploadProgress = 0;

  stats = { views: 0, enquiries: 0, rating: 0, reviewCount: 0 };

  private API = 'http://localhost:4000/api';

  constructor(public auth: AuthService, private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.headers() }).subscribe({
      next: user => { this.vendor = user; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get isPro(): boolean { return this.vendor?.vendorPlan === 'pro'; }

  get categories(): string[] {
    if (!this.vendor?.businessCategory) return [];
    return this.vendor.businessCategory.split(',').map((c: string) => c.trim()).filter(Boolean);
  }

  get businessImages(): any[] { return this.vendor?.businessImages || []; }
  get certificates(): any[] { return this.vendor?.certificates || []; }

  // ── MEDIA UPLOAD ──────────────────────────────────────────────────
  onMediaSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.mediaFiles = [...this.mediaFiles, ...files].slice(0, 20);
  }

  async uploadMedia() {
    if (!this.mediaFiles.length) return;
    this.mediaUploading = true;
    this.uploadProgress = 0;
    const fd = new FormData();
    this.mediaFiles.forEach(f => fd.append('files', f));
    this.http.post<any>(`${this.API}/users/media`, fd, { headers: this.headers() }).subscribe({
      next: user => {
        this.vendor = user;
        this.mediaFiles = [];
        this.mediaUploading = false;
        this.showMediaModal = false;
      },
      error: () => this.mediaUploading = false
    });
  }

  deleteMedia(publicId: string) {
    if (!confirm('Remove this image/video?')) return;
    this.http.delete<any>(`${this.API}/users/media/${encodeURIComponent(publicId)}`, { headers: this.headers() }).subscribe({
      next: user => this.vendor = user
    });
  }

  // ── CERT UPLOAD ───────────────────────────────────────────────────
  onCertSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.certFiles = [...this.certFiles, ...files].slice(0, 10);
  }

  uploadCerts() {
    if (!this.certFiles.length) return;
    this.certUploading = true;
    const fd = new FormData();
    this.certFiles.forEach(f => fd.append('files', f));
    this.http.post<any>(`${this.API}/users/certificates`, fd, { headers: this.headers() }).subscribe({
      next: user => {
        this.vendor = user;
        this.certFiles = [];
        this.certUploading = false;
        this.showCertModal = false;
      },
      error: () => this.certUploading = false
    });
  }

  deleteCert(publicId: string) {
    if (!confirm('Remove this certificate?')) return;
    this.http.delete<any>(`${this.API}/users/certificates/${encodeURIComponent(publicId)}`, { headers: this.headers() }).subscribe({
      next: user => this.vendor = user
    });
  }

  openPaystack() {
    const handler = (window as any).PaystackPop?.setup({
      key: 'pk_live_YOUR_PAYSTACK_PUBLIC_KEY',
      email: this.vendor?.email,
      amount: 500000,
      currency: 'NGN',
      ref: `VND-${this.vendor?._id}-${Date.now()}`,
      metadata: { vendorId: this.vendor?._id, plan: 'pro' },
      callback: (response: any) => this.verifyPayment(response.reference),
      onClose: () => {}
    });
    handler?.openIframe();
  }

  verifyPayment(reference: string) {
    this.http.post<any>(`${this.API}/vendors/upgrade`, { reference, vendorId: this.vendor._id }, { headers: this.headers() }).subscribe({
      next: () => {
        this.vendor = { ...this.vendor, vendorPlan: 'pro' };
        this.showUpgradeModal = false;
      },
      error: () => alert('Payment verification failed. Contact support.')
    });
  }

  logout() { this.auth.logout(); }

  isVideo(url: string): boolean {
    return /\.(mp4|mov|avi|webm|mkv)/i.test(url);
  }
}