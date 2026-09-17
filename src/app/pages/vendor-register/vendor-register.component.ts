import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-vendor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-register.component.html',
  styleUrls: ['./vendor-register.component.css']
})
export class VendorRegisterComponent implements OnInit, OnDestroy {
  step         = 1;
  loading      = false;
  error        = '';
  showPassword = false;        // ← fix 1

  form = {
    name:                '',
    email:               '',
    password:            '',
    businessName:        '',
    businessCategories:  [] as string[],
    otherCategory:       '',
    businessCity:        [] as string[],
    businessDescription: '',
    phone:               '',
    whatsapp:            '',
    instagramHandle:     '',
    termsAccepted:       false,
  };

  ninFile:        File | null = null;
  cacFile:        File | null = null;
  portfolioFiles: File[]      = [];
  ninPreview  = '';
  cacPreview  = '';

  readonly categories = [
    { id: 'catering',    label: 'Catering',         icon: '🍲' },
    { id: 'hall',        label: 'Event hall',        icon: '🏛️' },
    { id: 'photography', label: 'Photography',       icon: '📸' },
    { id: 'decoration',  label: 'Decoration',        icon: '✨' },
    { id: 'dj',          label: 'DJ & Sound',        icon: '🎧' },
    { id: 'mc',          label: 'MC / Host',         icon: '🎤' },
    { id: 'makeup',      label: 'Makeup & Beauty',   icon: '💄' },
    { id: 'fashion',     label: 'Fashion & Asoebi',  icon: '👗' },
    { id: 'cake',        label: 'Cake & Treats',     icon: '🎂' },
    { id: 'other',       label: 'Other service',     icon: '💼' },
  ];

  readonly cities = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
    'Enugu', 'Kaduna', 'Benin City', 'Owerri', 'Uyo', 'Other'
  ];

  get passwordStrength(): number {
    const p = this.form.password || '';
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (!this.form.password) return '';
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  }

  constructor(
    private auth:         AuthService,
    private router:       Router,
    public  themeService: ThemeService
  ) {}

  ngOnInit()    { this.themeService.startRotation(); }
  ngOnDestroy() { this.themeService.stopRotation();  }

  get hasOther(): boolean { return this.form.businessCategories.includes('other'); }

  // fix 2 — cityDisplay getter
  get cityDisplay(): string { return this.form.businessCity.join(', '); }

  toggleCategory(id: string) {
    const idx = this.form.businessCategories.indexOf(id);
    if (idx > -1) this.form.businessCategories.splice(idx, 1);
    else          this.form.businessCategories.push(id);
  }

  toggleCity(city: string) {
    const idx = this.form.businessCity.indexOf(city);
    if (idx > -1) this.form.businessCity.splice(idx, 1);
    else          this.form.businessCity.push(city);
  }

  onNINSelected(e: any) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.ninFile = f; this.ninPreview = f.name;
  }

  onCACSelected(e: any) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.cacFile = f; this.cacPreview = f.name;
  }

  onPortfolioSelected(e: any) {
    const files = Array.from((e.target as HTMLInputElement).files || []) as File[];
    this.portfolioFiles = [...this.portfolioFiles, ...files].slice(0, 10);
  }

  removePortfolio(i: number) { this.portfolioFiles.splice(i, 1); }

  // fix 3 — prevStep method
  prevStep() { if (this.step > 1) this.step--; }

  nextStep() {
    this.error = '';
    if (this.step === 1) {
      if (!this.form.name.trim() || !this.form.email.trim() || !this.form.password) {
        this.error = 'Please fill in all required fields.'; return;
      }
      if (this.form.password.length < 8) {
        this.error = 'Password must be at least 8 characters.'; return;
      }
    }
    if (this.step === 2) {
      if (!this.form.businessName.trim() || !this.form.businessCategories.length) {
        this.error = 'Business name and at least one category are required.'; return;
      }
      if (this.hasOther && !this.form.otherCategory.trim()) {
        this.error = 'Please describe your service in the "Other" field.'; return;
      }
      if (!this.form.businessCity.length) {
        this.error = 'Please select at least one city.'; return;
      }
      if (!this.form.phone.trim()) {
        this.error = 'Phone number is required.'; return;
      }
    }
    this.step++;
  }

  submit() {
    if (!this.form.termsAccepted) {
      this.error = 'You must accept the terms to continue.'; return;
    }
    this.loading = true; this.error = '';

    const categoryString = this.form.businessCategories
      .map(c => c === 'other' && this.form.otherCategory
        ? this.form.otherCategory.trim() : c)
      .join(',');

    this.auth.register({
      name:                this.form.name.trim(),
      email:               this.form.email.trim(),
      password:            this.form.password,
      role:                'vendor',
      businessName:        this.form.businessName.trim(),
      businessCategory:    categoryString,
      businessCity:        this.form.businessCity,
      businessDescription: this.form.businessDescription.trim(),
      phone:               this.form.phone.trim(),
      whatsapp:            this.form.whatsapp.trim(),
    }).subscribe({
      next:  () => this.router.navigate(['/vendor/dashboard']),
      error: err => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}