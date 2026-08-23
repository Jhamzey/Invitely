import { Component } from '@angular/core';
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
export class VendorRegisterComponent {
  step = 1;
  loading = false;
  error = '';

  form = {
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessCategory: '',
    businessCity: '',
    businessDescription: '',
    phone: '',
    whatsapp: '',
    instagramHandle: '',
    yearsInBusiness: '',
    termsAccepted: false,
    identityVerified: false,
  };

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

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  nextStep() {
    if (this.step === 1 && (!this.form.name || !this.form.email || !this.form.password)) {
      this.error = 'Fill in all required fields.'; return;
    }
    if (this.step === 2 && (!this.form.businessName || !this.form.businessCategory || !this.form.businessCity)) {
      this.error = 'Fill in all required fields.'; return;
    }
    this.error = '';
    this.step++;
  }

  submit() {
    if (!this.form.termsAccepted) { this.error = 'You must accept the terms to continue.'; return; }
    if (!this.form.phone) { this.error = 'Phone number is required for verification.'; return; }
    this.loading = true;
    this.auth.register({
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: 'vendor',
      businessName: this.form.businessName,
      businessCategory: this.form.businessCategory,
      businessCity: this.form.businessCity,
    }).subscribe({
      next: () => this.router.navigate(['/vendor/dashboard']),
      error: err => { this.error = err.error?.error || 'Registration failed.'; this.loading = false; }
    });
  }
}