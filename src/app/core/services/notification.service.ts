import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { AppNotification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private API = `${environment.apiUrl}/notifications`;
  private pollSub?: Subscription;

  notifications$ = new BehaviorSubject<AppNotification[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  startPolling() {
    this.fetch();
    this.pollSub?.unsubscribe();
    this.pollSub = interval(30000).subscribe(() => this.fetch());
  }

  stopPolling() { this.pollSub?.unsubscribe(); }

  fetch() {
    if (!this.auth.isLoggedIn()) return;
    this.http.get<{ notifications: AppNotification[]; unreadCount: number }>(this.API, { headers: this.headers() }).subscribe({
      next: res => { this.notifications$.next(res.notifications); this.unreadCount$.next(res.unreadCount); },
      error: () => {}
    });
  }

  markRead(id: string) {
    this.http.patch(`${this.API}/${id}/read`, {}, { headers: this.headers() }).subscribe({ next: () => this.fetch() });
  }

  markAllRead() {
    this.http.patch(`${this.API}/read-all`, {}, { headers: this.headers() }).subscribe({ next: () => this.fetch() });
  }

  clearAll() {
    this.http.delete(this.API, { headers: this.headers() }).subscribe({ next: () => this.fetch() });
  }

  ngOnDestroy() { this.stopPolling(); }
}