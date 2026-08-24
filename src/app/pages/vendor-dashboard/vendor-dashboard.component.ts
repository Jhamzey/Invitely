import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css']
})
export class VendorDashboardComponent implements OnInit {
  vendor: any = null;
  loading = true;
  showUpgradeModal = false;
  showCertModal = false;

  certFiles: File[] = [];

  stats = { views: 0, enquiries: 0, rating: 0, reviewCount: 0 };

  private API = 'http://localhost:4000/api';

  constructor(public auth: AuthService, private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
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

  onCertSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.certFiles = [...this.certFiles, ...files].slice(0, 10);
  }

  removeCert(i: number) { this.certFiles.splice(i, 1); }

  openPaystack() {
    // Paystack inline popup
    const handler = (window as any).PaystackPop?.setup({
      key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY',
      email: this.vendor?.email,
      amount: 500000, // ₦5,000 in kobo
      currency: 'NGN',
      ref: `VND-${this.vendor?._id}-${Date.now()}`,
      metadata: { vendorId: this.vendor?._id, plan: 'pro' },
      callback: (response: any) => {
        this.verifyPayment(response.reference);
      },
      onClose: () => {}
    });
    handler?.openIframe();
  }

  verifyPayment(reference: string) {
    this.http.post(`${this.API}/vendors/upgrade`, { reference, vendorId: this.vendor._id }, { headers: this.headers() }).subscribe({
      next: (res: any) => {
        this.vendor = { ...this.vendor, vendorPlan: 'pro' };
        this.showUpgradeModal = false;
        alert('Upgrade successful! You now have Pro access.');
      },
      error: () => alert('Payment verification failed. Contact support.')
    });
  }

  logout() { this.auth.logout(); }
}