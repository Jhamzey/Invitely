import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab = 'overview';
  loading = true;

  stats = { hosts: 0, vendors: 0, events: 0, guests: 0, revenue: 0 };
  users: any[] = [];
  vendors: any[] = [];
  events: any[] = [];

  searchUsers = '';
  searchVendors = '';
  filterVerified = 'all';

  private API = 'http://localhost:4000/api';

  constructor(private auth: AuthService, private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadVendors();
  }

  loadStats() {
    this.http.get<any>(`${this.API}/admin/stats`, { headers: this.headers() }).subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadUsers() {
    this.http.get<any[]>(`${this.API}/admin/users`, { headers: this.headers() }).subscribe({
      next: u => this.users = u,
      error: () => {}
    });
  }

  loadVendors() {
    this.http.get<any[]>(`${this.API}/admin/vendors`, { headers: this.headers() }).subscribe({
      next: v => this.vendors = v,
      error: () => {}
    });
  }

  verifyVendor(id: string) {
    this.http.patch(`${this.API}/admin/vendors/${id}/verify`, {}, { headers: this.headers() }).subscribe({
      next: () => { const v = this.vendors.find(x => x._id === id); if (v) v.verified = true; }
    });
  }

  suspendUser(id: string) {
    if (!confirm('Suspend this user?')) return;
    this.http.patch(`${this.API}/admin/users/${id}/suspend`, {}, { headers: this.headers() }).subscribe({
      next: () => { const u = this.users.find(x => x._id === id); if (u) u.suspended = true; }
    });
  }

  get filteredVendors() {
    return this.vendors.filter(v => {
      const ms = !this.searchVendors || v.businessName?.toLowerCase().includes(this.searchVendors.toLowerCase()) || v.name?.toLowerCase().includes(this.searchVendors.toLowerCase());
      const mf = this.filterVerified === 'all' || (this.filterVerified === 'verified' && v.verified) || (this.filterVerified === 'pending' && !v.verified);
      return ms && mf;
    });
  }

  get filteredUsers() {
    return this.users.filter(u => !this.searchUsers || u.name?.toLowerCase().includes(this.searchUsers.toLowerCase()) || u.email?.toLowerCase().includes(this.searchUsers.toLowerCase()));
  }

  logout() { this.auth.logout(); }
}