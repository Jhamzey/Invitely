import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  private returnUrl = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.startRotation();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Already logged in — redirect
    if (this.auth.isLoggedIn()) {
      this.redirectAfterLogin(this.auth.user()?.role);
    }
  }

  ngOnDestroy() {
    this.themeService.stopRotation();
  }

  private redirectAfterLogin(role: string) {
    if (this.returnUrl) {
      this.router.navigateByUrl('/' + this.returnUrl);
    } else if (role === 'vendor') {
      this.router.navigate(['/vendor/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  submit() {
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.redirectAfterLogin(res.user?.role || 'host');
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid email or password.';
        this.loading = false;
      }
    });
  }
}