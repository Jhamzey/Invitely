import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

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

  originalCategories: string[] = [];

  readonly categories = [
    { id: 'catering', label: 'Catering' }, { id: 'hall', label: 'Event hall' },
    { id: 'photography', label: 'Photography' }, { id: 'decoration', label: 'Decoration' },
    { id: 'dj', label: 'DJ / Band' }, { id: 'mc', label: 'MC' },
    { id: 'makeup', label: 'Makeup artist' }, { id: 'fashion', label: 'Fashion designer' },
    { id: 'cake', label: 'Cake maker' }, { id: 'other', label: 'Other' },
  ];

  readonly languages = [
    { code: 'EN', label: 'English' }, { code: 'YO', label: 'Yoruba' },
    { code: 'IG', label: 'Igbo' }, { code: 'HA', label: 'Hausa' },
    { code: 'FR', label: 'French' }, { code: 'PID', label: 'Pidgin' },
  ];

  readonly cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Kaduna', 'Benin City', 'Owerri', 'Uyo', 'Other'];

  readonly states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
    'Taraba', 'Yobe', 'Zamfara',
  ];

  private API = environment.apiUrl;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    public themeService: ThemeService
  ) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.http.get<any>(`${this.API}/auth/me`, { headers: this.headers() }).subscribe({
      next: u => {
        this.profile = { ...u };
        this.originalCategories = (u.businessCategory || '').split(',').map((c: string) => c.trim()).filter(Boolean);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get selectedCategories(): string[] {
    if (!this.profile.businessCategory) return [];
    return this.profile.businessCategory.split(',').map((c: string) => c.trim()).filter(Boolean);
  }

  isOriginalCategory(id: string): boolean {
    return this.originalCategories.includes(id);
  }

  toggleCategory(id: string) {
    if (this.isOriginalCategory(id)) return;
    const current = [...this.selectedCategories];
    const idx = current.indexOf(id);
    if (idx > -1) current.splice(idx, 1);
    else current.push(id);
    this.profile.businessCategory = current.join(',');
  }

  setLight() { if (this.themeService.isDark()) this.themeService.toggleDarkMode(); }
  setDark() { if (!this.themeService.isDark()) this.themeService.toggleDarkMode(); }

  save() {
    this.saving = true;
    this.http.put<any>(`${this.API}/users/profile`, {
      name: this.profile.name, businessName: this.profile.businessName,
      businessCategory: this.profile.businessCategory, businessCity: this.profile.businessCity,
      businessAddress: this.profile.businessAddress, businessState: this.profile.businessState,
      businessDescription: this.profile.businessDescription, priceFrom: this.profile.priceFrom,
      phone: this.profile.phone, whatsapp: this.profile.whatsapp,
      emailNotifications: this.profile.emailNotifications,
      language: this.profile.language,
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
    this.http.post(`${this.API}/users/change-password`, {
      currentPassword: this.currentPassword, newPassword: this.newPassword
    }, { headers: this.headers() }).subscribe({
      next: () => { this.passwordSaved = true; this.changingPassword = false; this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; setTimeout(() => this.passwordSaved = false, 3000); },
      error: err => { this.passwordError = err.error?.error || 'Failed.'; this.changingPassword = false; }
    });
  }
}