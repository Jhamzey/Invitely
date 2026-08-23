import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:4000/api/auth';
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
    localStorage.removeItem('invitely_token');
    localStorage.removeItem('invitely_user');
    this.user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('invitely_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(res: any) {
    localStorage.setItem('invitely_token', res.token);
    localStorage.setItem('invitely_user', JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private getStoredUser() {
    const u = localStorage.getItem('invitely_user');
    return u ? JSON.parse(u) : null;
  }
}