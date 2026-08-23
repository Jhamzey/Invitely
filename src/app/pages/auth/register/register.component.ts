import { Component } from '@angular/core';
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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  showPassword = false;

  readonly eventTypes = [
    { id: 'wedding', icon: '💍', label: 'Wedding' },
    { id: 'birthday', icon: '🎂', label: 'Birthday' },
    { id: 'conference', icon: '🎤', label: 'Conference' },
    { id: 'owambe', icon: '💃', label: 'Owambe' },
  ];

  selectedType = 'wedding';

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  get passwordStrength(): number {
    const p = this.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  get strengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.passwordStrength] || '';
  }

  get strengthColor(): string {
    const colors = ['', '#e63946', '#f4a261', '#2a9d8f', '#1a8a5e'];
    return colors[this.passwordStrength] || '';
  }

  submit() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}