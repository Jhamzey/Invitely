import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.css']
})
export class VendorProfileComponent implements OnInit {
  profile: any = {};
  loading = true;
  saving = false;
  saved = false;
  error = '';
  activeTab = 'listing';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  passwordSaved = false;
  passwordError = '';

  readonly categories = [
    { id: 'catering', icon: '🍽️', label: 'Catering' },
    { id: 'hall', icon: '🏛️', label: 'Event hall' },
    { id: 'photography', icon: '📸', label: 'Photography' },
    { id: 'decoration', icon: '🎀', label: 'Decoration' },
    { id: 'dj', icon: '🎵', label: 'DJ / Band' },
    { id: 'mc', icon: '🎤', label: 'MC' },
    { id: 'makeup', icon: '💄', label: 'Makeup artist' },
    { id: 'fashion', icon: '👗', label: 'Fashion designer' },
    { id: 'cake', icon: '🎂', label: 'Cake maker' },
    { id: 'other', icon: '🔗', label: 'Other' },
  ];

  readonly cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Kaduna', 'Benin City', 'Other'];

  private API = 'http://localhost:4000/api';

  constructor(public auth: AuthService, private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.headers() }).subscribe({
      next: u => { this.profile = { ...u }; this.loading = false; },
      error: () => this.loading = false
    });
  }

  save() {
    this.saving = true;
    this.http.put<any>(`${this.API}/users/profile`, {
      name: this.profile.name,
      businessName: this.profile.businessName,
      businessCategory: this.profile.businessCategory,
      businessCity: this.profile.businessCity,
      businessDescription: this.profile.businessDescription,
      phone: this.profile.phone,
      whatsapp: this.profile.whatsapp,
      emailNotifications: this.profile.emailNotifications,
      whatsappNotifications: this.profile.whatsappNotifications,
    }, { headers: this.headers() }).subscribe({
      next: u => { this.profile = { ...u }; this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 2500); },
      error: err => { this.error = err.error?.error || 'Failed.'; this.saving = false; }
    });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword) { this.passwordError = 'Fill all fields.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = 'Passwords do not match.'; return; }
    this.changingPassword = true;
    this.passwordError = '';
    this.http.post(`${this.API}/users/change-password`, { currentPassword: this.currentPassword, newPassword: this.newPassword }, { headers: this.headers() }).subscribe({
      next: () => { this.passwordSaved = true; this.changingPassword = false; this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; setTimeout(() => this.passwordSaved = false, 3000); },
      error: err => { this.passwordError = err.error?.error || 'Failed.'; this.changingPassword = false; }
    });
  }
}