import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  user = signal<any>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any) {
    return this.http.post<any>(`${this.API}/register`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('invitely_token');
      localStorage.removeItem('invitely_user');
    }
    this.user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('invitely_token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() >= payload.exp * 1000) {
        this.logout();
        return false;
      }
    } catch { return false; }
    return true;
  }

  private storeSession(res: any) {
    if (this.isBrowser) {
      localStorage.setItem('invitely_token', res.token);
      localStorage.setItem('invitely_user', JSON.stringify(res.user));
    }
    this.user.set(res.user);
  }

  private getStoredUser() {
    if (!this.isBrowser) return null;
    const u = localStorage.getItem('invitely_user');
    return u ? JSON.parse(u) : null;
  }
}