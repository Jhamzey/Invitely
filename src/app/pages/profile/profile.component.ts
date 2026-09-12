import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

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
  activeTab = 'profile';
  showUpgradeModal = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  passwordSaved = false;
  passwordError = '';

  banks: { name: string; code: string }[] = [];
  selectedBankCode = '';
  payoutAccountNumber = '';
  connectingPayout = false;
  payoutError = '';

  showDeleteConfirm = false;
  deletePassword = '';
  deleteError = '';
  deleting = false;

  readonly languages = [
    { code: 'EN', label: 'English' }, { code: 'YO', label: 'Yoruba' },
    { code: 'IG', label: 'Igbo' }, { code: 'HA', label: 'Hausa' },
    { code: 'FR', label: 'French' }, { code: 'PID', label: 'Pidgin' },
  ];

  private API = environment.apiUrl;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private router: Router,
    public themeService: ThemeService
  ) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.headers() }).subscribe({
      next: u => { this.profile = { ...u }; this.loading = false; },
      error: () => this.loading = false
    });
    this.loadBanks();
  }

  setLight() { if (this.themeService.isDark()) this.themeService.toggleDarkMode(); }
  setDark() { if (!this.themeService.isDark()) this.themeService.toggleDarkMode(); }

  save() {
    this.saving = true;
    this.http.put<any>(`${this.API}/users/profile`, {
      name: this.profile.name, phone: this.profile.phone, whatsapp: this.profile.whatsapp,
      language: this.profile.language, emailNotifications: this.profile.emailNotifications,
      whatsappNotifications: this.profile.whatsappNotifications,
    }, { headers: this.headers() }).subscribe({
      next: u => { this.profile = { ...u }; this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 2500); },
      error: err => { this.error = err.error?.error || 'Failed.'; this.saving = false; }
    });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword) { this.passwordError = 'Fill all fields.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = 'Passwords do not match.'; return; }
    if (this.newPassword.length < 8) { this.passwordError = 'At least 8 characters.'; return; }
    this.changingPassword = true;
    this.passwordError = '';
    this.http.post<any>(`${this.API}/users/change-password`, {
      currentPassword: this.currentPassword, newPassword: this.newPassword
    }, { headers: this.headers() }).subscribe({
      next: res => {
        if (res.token) localStorage.setItem('invitely_token', res.token);
        this.passwordSaved = true; this.changingPassword = false;
        this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = '';
        setTimeout(() => this.passwordSaved = false, 3000);
      },
      error: err => { this.passwordError = err.error?.error || 'Failed.'; this.changingPassword = false; }
    });
  }

  loadBanks() {
    this.http.get<any[]>(`${this.API}/users/paystack-banks`, { headers: this.headers() }).subscribe({
      next: banks => this.banks = banks,
      error: () => {}
    });
  }

  connectPayout() {
    if (!this.selectedBankCode || !this.payoutAccountNumber) { this.payoutError = 'Select a bank and enter your account number.'; return; }
    this.connectingPayout = true;
    this.payoutError = '';
    this.http.post<any>(`${this.API}/users/paystack-subaccount`, { bankCode: this.selectedBankCode, accountNumber: this.payoutAccountNumber }, { headers: this.headers() }).subscribe({
      next: res => { this.profile.bankAccountName = res.accountName; this.connectingPayout = false; },
      error: err => { this.payoutError = err.error?.error || 'Could not connect payout account.'; this.connectingPayout = false; }
    });
  }

  deleteAccount() {
    if (!this.deletePassword) { this.deleteError = 'Enter your password to confirm.'; return; }
    this.deleting = true;
    this.deleteError = '';
    this.http.post<any>(`${this.API}/users/delete-account`, { password: this.deletePassword }, { headers: this.headers() }).subscribe({
      next: () => { this.auth.logout(); this.router.navigate(['/']); },
      error: err => { this.deleteError = err.error?.error || 'Could not delete account.'; this.deleting = false; }
    });
  }
}