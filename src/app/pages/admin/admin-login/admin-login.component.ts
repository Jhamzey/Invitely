import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;
  private inactivityTimer: any;

  private API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('invitely_admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() < payload.exp * 1000) {
          this.router.navigate(['/admin']);
          return;
        }
      } catch {}
      localStorage.removeItem('invitely_admin_token');
      localStorage.removeItem('invitely_admin_user');
    }
  }

  ngOnDestroy() { clearTimeout(this.inactivityTimer); }

  submit() {
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.error = '';
    this.http.post<any>(`${this.API}/admin/login`, { email: this.email, password: this.password }).subscribe({
      next: res => {
        localStorage.setItem('invitely_admin_token', res.token);
        localStorage.setItem('invitely_admin_user', JSON.stringify(res.user));
        this.router.navigate(['/admin']);
      },
      error: err => {
        this.error = err.error?.error || 'Invalid admin credentials.';
        this.loading = false;
      }
    });
  }
}