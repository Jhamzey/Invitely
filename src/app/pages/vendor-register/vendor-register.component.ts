import { Component, OnInit } from '@angular/core';
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
export class VendorRegisterComponent implements OnInit {
  step = 1;
  loading = false;
  error = '';

  form = {
    name: '', email: '', password: '',
    businessName: '', businessCategories: [] as string[], otherCategory: '',
    businessCity: '', businessDescription: '',
    phone: '', whatsapp: '', instagramHandle: '',
    termsAccepted: false,
  };

  // Credential uploads
  ninFile: File | null = null;
  cacFile: File | null = null;
  portfolioFiles: File[] = [];
  ninPreview = '';
  cacPreview = '';

  readonly categories = [
    { id: 'catering', label: 'Catering' },
    { id: 'hall', label: 'Event hall' },
    { id: 'photography', label: 'Photography' },
    { id: 'decoration', label: 'Decoration' },
    { id: 'dj', label: 'DJ / Band' },
    { id: 'mc', label: 'MC' },
    { id: 'makeup', label: 'Makeup artist' },
    { id: 'fashion', label: 'Fashion designer' },
    { id: 'cake', label: 'Cake maker' },
    { id: 'other', label: 'Other' },
  ];

  readonly cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Kaduna', 'Benin City', 'Owerri', 'Uyo', 'Other'];

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.startRotation();
  }

  get hasOther(): boolean { return this.form.businessCategories.includes('other'); }

  toggleCategory(id: string) {
    const idx = this.form.businessCategories.indexOf(id);
    if (idx > -1) {
      this.form.businessCategories.splice(idx, 1);
    } else {
      this.form.businessCategories.push(id);
    }
  }

  onNINSelected(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    this.ninFile = file;
    this.ninPreview = file.name;
  }

  onCACSelected(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    this.cacFile = file;
    this.cacPreview = file.name;
  }

  onPortfolioSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    this.portfolioFiles = [...this.portfolioFiles, ...files].slice(0, 10);
  }

  removePortfolio(i: number) {
    this.portfolioFiles.splice(i, 1);
  }

  nextStep() {
    this.error = '';
    if (this.step === 1 && (!this.form.name || !this.form.email || !this.form.password)) {
      this.error = 'Fill in all required fields.'; return;
    }
    if (this.step === 1 && this.form.password.length < 8) {
      this.error = 'Password must be at least 8 characters.'; return;
    }
    if (this.step === 2 && (!this.form.businessName || !this.form.businessCategories.length || !this.form.businessCity)) {
      this.error = 'Fill in all required fields including at least one service category.'; return;
    }
    if (this.step === 2 && this.hasOther && !this.form.otherCategory) {
      this.error = 'Please describe your service in the "Other" field.'; return;
    }
    if (this.step === 2 && !this.form.phone) {
      this.error = 'Phone number is required.'; return;
    }
    this.step++;
  }

  submit() {
    if (!this.form.termsAccepted) { this.error = 'You must accept the terms to continue.'; return; }
    this.loading = true;
    const categories = this.form.businessCategories.join(',');
    this.auth.register({
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: 'vendor',
      businessName: this.form.businessName,
      businessCategory: categories,
      businessCity: this.form.businessCity,
      businessDescription: this.form.businessDescription,
      phone: this.form.phone,
      whatsapp: this.form.whatsapp,
    }).subscribe({
      next: () => this.router.navigate(['/vendor/dashboard']),
      error: err => { this.error = err.error?.error || 'Registration failed.'; this.loading = false; }
    });
  }
}