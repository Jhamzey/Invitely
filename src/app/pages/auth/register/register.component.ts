import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  role: 'host' | 'vendor' = 'host';
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  showPassword = false;

  readonly eventTypes = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'conference', label: 'Conference' },
    { id: 'owambe', label: 'Owambe' },
  ];
  selectedType = 'wedding';

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.startRotation();
    if (this.auth.isLoggedIn()) {
      const r = this.auth.user()?.role;
      this.router.navigate([r === 'vendor' ? '/vendor/dashboard' : '/dashboard']);
    }
  }

  selectRole(r: 'host' | 'vendor') {
    if (r === 'vendor') { this.router.navigate(['/vendor/register']); return; }
    this.role = r;
  }

  get passwordStrength(): number {
    const p = this.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  get strengthLabel(): string { return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] || ''; }
  get strengthColor(): string { return ['', '#e63946', '#f4a261', '#2a9d8f', '#1a8a5e'][this.passwordStrength] || ''; }

  submit() {
    if (!this.name || !this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }
    this.loading = true;
    this.error = '';
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: 'host' }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => { this.error = err.error?.error || 'Registration failed.'; this.loading = false; }
    });
  }
}