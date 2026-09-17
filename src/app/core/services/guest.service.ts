import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Guest } from '../models/guest.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private API = `${environment.apiUrl}/guests`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getAll(eventId: string) {
    return this.http.get<Guest[]>(`${this.API}/${eventId}`, { headers: this.headers() });
  }

  add(eventId: string, guest: Partial<Guest>) {
    return this.http.post<Guest>(`${this.API}/${eventId}`, guest, { headers: this.headers() });
  }

  update(eventId: string, guestId: string, data: Partial<Guest>) {
    return this.http.put<Guest>(`${this.API}/${eventId}/${guestId}`, data, { headers: this.headers() });
  }

  delete(eventId: string, guestId: string) {
    return this.http.delete(`${this.API}/${eventId}/${guestId}`, { headers: this.headers() });
  }

  bulkAdd(eventId: string, guests: Partial<Guest>[]) {
    return this.http.post<{ created: Guest[]; duplicates: any[]; importedCount: number; duplicateCount: number }>(
      `${this.API}/${eventId}/bulk`, { guests }, { headers: this.headers() }
    );
  }

  revoke(eventId: string, guestId: string) {
    return this.http.patch<Guest>(`${this.API}/${eventId}/${guestId}/revoke`, {}, { headers: this.headers() });
  }

  rsvp(token: string, rsvp: string, mealChoice: string) {
    return this.http.patch<Guest>(`${this.API}/rsvp/${token}`, { rsvp, mealChoice });
  }

  exportGuestsCsv(eventId: string) {
    return this.http.get(`${this.API}/${eventId}/export`, {
      headers: this.headers(),
      responseType: 'blob'
    });
  }

  sendInvite(eventId: string, guestId: string) {
    return this.http.post<{ success: boolean; message: string; guest: Guest }>(
      `${this.API}/${eventId}/${guestId}/send-invite`,
      {},
      { headers: this.headers() }
    );
  }

  sendAllInvites(eventId: string) {
    return this.http.post<{ success: boolean; totalEligible: number; sentCount: number; failedCount: number }>(
      `${this.API}/${eventId}/send-all-invites`,
      {},
      { headers: this.headers() }
    );
  }
}