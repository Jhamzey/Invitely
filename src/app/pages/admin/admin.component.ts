import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  loading = true;
  sidebarOpen = false;
  private inactivityTimer: any;

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }

  stats = { hosts: 0, vendors: 0, events: 0, guests: 0, revenue: 0, deletedUsers: 0, suspendedUsers: 0, pendingVendors: 0, pendingListings: 0 };
  users: any[] = [];
  vendors: any[] = [];
  events: any[] = [];
  deletedUsers: any[] = [];
  auditLogs: any[] = [];
  auditTotal = 0;
  reviews: any[] = [];
  reviewsTotal = 0;
  verifications: any[] = [];
  verificationFilter = 'pending';
  verificationNotes: Record<string, string> = {};

  searchUsers = '';
  searchVendors = '';
  filterVerified = 'all';
  auditFilterAction = '';
  auditFilterRole = '';

  adminUser: any = null;

  private API = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private headers() {
    const token = localStorage.getItem('invitely_admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit() {
    const raw = localStorage.getItem('invitely_admin_user');
    this.adminUser = raw ? JSON.parse(raw) : null;
    this.resetInactivityTimer();
    this.loadStats();
    this.loadUsers();
    this.loadVendors();
    this.loadEvents();
    this.loadDeletedUsers();
    this.loadAuditLogs();
    this.loadReviews();
    this.loadVerifications();
  }

  ngOnDestroy() { clearTimeout(this.inactivityTimer); }

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => this.logout(), 5 * 60 * 1000);
  }

  loadStats() {
    this.http.get<any>(`${this.API}/admin/stats`, { headers: this.headers() }).subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadUsers() {
    this.http.get<any>(`${this.API}/admin/users`, { headers: this.headers() }).subscribe({
      next: res => this.users = res.users || [],
      error: () => {}
    });
  }

  loadVendors() {
    this.http.get<any>(`${this.API}/admin/vendors`, { headers: this.headers() }).subscribe({
      next: res => this.vendors = res.vendors || [],
      error: () => {}
    });
  }

  loadEvents() {
    this.http.get<any>(`${this.API}/admin/events`, { headers: this.headers() }).subscribe({
      next: res => this.events = res.events || [],
      error: () => {}
    });
  }

  loadDeletedUsers() {
    this.http.get<any[]>(`${this.API}/admin/deleted-users`, { headers: this.headers() }).subscribe({
      next: res => this.deletedUsers = res || [],
      error: () => {}
    });
  }

  loadAuditLogs() {
    const p = new URLSearchParams();
    if (this.auditFilterAction) p.set('action', this.auditFilterAction);
    if (this.auditFilterRole) p.set('actorRole', this.auditFilterRole);
    const params = p.toString() ? '?' + p.toString() : '';
    this.http.get<any>(`${this.API}/admin/audit-logs${params}`, { headers: this.headers() }).subscribe({
      next: res => { this.auditLogs = res.logs || []; this.auditTotal = res.total || 0; },
      error: () => {}
    });
  }

  loadReviews() {
    this.http.get<any>(`${this.API}/admin/reviews`, { headers: this.headers() }).subscribe({
      next: res => { this.reviews = res.reviews || []; this.reviewsTotal = res.total || 0; },
      error: () => {}
    });
  }

  loadVerifications() {
    this.http.get<any[]>(`${this.API}/admin/verifications?status=${this.verificationFilter}`, { headers: this.headers() }).subscribe({
      next: res => this.verifications = res || [],
      error: () => {}
    });
  }

  reviewVerification(userId: string, status: 'verified' | 'rejected' | 'escalated') {
    const notes = this.verificationNotes[userId] || '';
    if (status === 'rejected' && !confirm('Reject this verification submission?')) return;
    this.http.patch(`${this.API}/admin/verifications/${userId}`, { status, adminNotes: notes }, { headers: this.headers() }).subscribe({
      next: () => {
        this.verifications = this.verifications.filter(v => v._id !== userId);
        this.loadAuditLogs();
        this.loadUsers();
        this.loadVendors();
      }
    });
  }

  removeReview(id: string) {
    if (!confirm('Remove this review permanently? This cannot be undone (though the removal itself will be recorded in the audit log).')) return;
    this.http.delete(`${this.API}/admin/reviews/${id}`, { headers: this.headers() }).subscribe({
      next: () => { this.reviews = this.reviews.filter(r => r._id !== id); this.loadAuditLogs(); }
    });
  }

  verifyVendor(id: string) {
    this.http.patch(`${this.API}/admin/vendors/${id}/verify`, {}, { headers: this.headers() }).subscribe({
      next: () => { const v = this.vendors.find(x => x._id === id); if (v) v.verified = true; this.loadAuditLogs(); }
    });
  }

  rejectVendor(id: string) {
    if (!confirm('Reject and suspend this vendor?')) return;
    this.http.patch(`${this.API}/admin/vendors/${id}/reject`, {}, { headers: this.headers() }).subscribe({
      next: () => { const v = this.vendors.find(x => x._id === id); if (v) { v.verified = false; v.suspended = true; } this.loadAuditLogs(); }
    });
  }

  verifyListing(vendorId: string, index: number) {
    this.http.patch(`${this.API}/admin/vendors/${vendorId}/listings/${index}/verify`, {}, { headers: this.headers() }).subscribe({
      next: (updated: any) => {
        const v = this.vendors.find(x => x._id === vendorId);
        if (v) v.additionalListings = updated.additionalListings;
        this.loadAuditLogs();
      }
    });
  }

  rejectListing(vendorId: string, index: number) {
    this.http.patch(`${this.API}/admin/vendors/${vendorId}/listings/${index}/reject`, {}, { headers: this.headers() }).subscribe({
      next: (updated: any) => {
        const v = this.vendors.find(x => x._id === vendorId);
        if (v) v.additionalListings = updated.additionalListings;
        this.loadAuditLogs();
      }
    });
  }

  suspendUser(id: string) {
    if (!confirm('Suspend this user?')) return;
    this.http.patch(`${this.API}/admin/users/${id}/suspend`, {}, { headers: this.headers() }).subscribe({
      next: () => { const u = this.users.find(x => x._id === id); if (u) u.suspended = true; this.loadAuditLogs(); }
    });
  }

  unsuspendUser(id: string) {
    this.http.patch(`${this.API}/admin/users/${id}/unsuspend`, {}, { headers: this.headers() }).subscribe({
      next: () => { const u = this.users.find(x => x._id === id); if (u) u.suspended = false; this.loadAuditLogs(); }
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

  get pendingListingVendors() {
    return this.vendors.filter(v => (v.additionalListings || []).some((l: any) => !l.verified));
  }

  logout() {
    clearTimeout(this.inactivityTimer);
    localStorage.removeItem('invitely_admin_token');
    localStorage.removeItem('invitely_admin_user');
    this.router.navigate(['/admin/login']);
  }
}