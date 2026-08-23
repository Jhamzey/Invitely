import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Guest } from '../models/guest.model';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private API = 'http://localhost:4000/api/guests';

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
    return this.http.post<Guest[]>(`${this.API}/${eventId}/bulk`, { guests }, { headers: this.headers() });
  }

  rsvp(token: string, rsvp: string, mealChoice: string) {
    return this.http.patch<Guest>(`${this.API}/rsvp/${token}`, { rsvp, mealChoice });
  }
}