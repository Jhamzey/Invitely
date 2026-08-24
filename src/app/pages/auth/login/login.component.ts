import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;
  role: 'host' | 'vendor' = 'host';

  constructor(
    private auth: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.startRotation();
    // If already logged in, redirect
    if (this.auth.isLoggedIn()) {
      const r = this.auth.user()?.role;
      this.router.navigate([r === 'vendor' ? '/vendor/dashboard' : '/dashboard']);
    }
  }

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const userRole = res.user?.role || 'host';
        if (userRole === 'vendor') {
          this.router.navigate(['/vendor/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid email or password.';
        this.loading = false;
      }
    });
  }
}