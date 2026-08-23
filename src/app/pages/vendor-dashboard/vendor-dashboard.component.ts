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
  enquiries: any[] = [];

  stats = { views: 0, enquiries: 0, bookings: 0, rating: 0 };

  private API = 'http://localhost:4000/api';

  constructor(public auth: AuthService, private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.headers() }).subscribe({
      next: user => {
        this.vendor = user;
        this.loading = false;
        this.stats.rating = 4.8; // From vendor listing
      },
      error: () => this.loading = false
    });
  }

  get isPro(): boolean {
    return this.vendor?.vendorPlan === 'pro';
  }
}