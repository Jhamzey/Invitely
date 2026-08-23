import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  loading = true;
  saving = false;
  saved = false;
  error = '';

  // Password change
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  passwordSaved = false;
  passwordError = '';

  activeTab = 'profile';

  readonly languages = [
    { code: 'EN', label: 'English' },
    { code: 'YO', label: 'Yoruba' },
    { code: 'IG', label: 'Igbo' },
    { code: 'HA', label: 'Hausa' },
    { code: 'FR', label: 'French' },
    { code: 'PID', label: 'Nigerian Pidgin' },
  ];

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
      phone: this.profile.phone,
      whatsapp: this.profile.whatsapp,
      language: this.profile.language,
      emailNotifications: this.profile.emailNotifications,
      whatsappNotifications: this.profile.whatsappNotifications,
      bankName: this.profile.bankName,
      bankAccountNumber: this.profile.bankAccountNumber,
      bankAccountName: this.profile.bankAccountName,
    }, { headers: this.headers() }).subscribe({
      next: u => {
        this.profile = { ...u };
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
      },
      error: err => { this.error = err.error?.error || 'Failed to save.'; this.saving = false; }
    });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword) { this.passwordError = 'Fill all fields.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = 'Passwords do not match.'; return; }
    if (this.newPassword.length < 8) { this.passwordError = 'Password must be at least 8 characters.'; return; }
    this.changingPassword = true;
    this.passwordError = '';
    this.http.post(`${this.API}/users/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }, { headers: this.headers() }).subscribe({
      next: () => {
        this.passwordSaved = true;
        this.changingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordSaved = false, 3000);
      },
      error: err => { this.passwordError = err.error?.error || 'Failed.'; this.changingPassword = false; }
    });
  }
}