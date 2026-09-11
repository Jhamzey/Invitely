import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Event } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private API = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  private fileHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  private optionalHeaders() {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getMomentsFeed() {
    return this.http.get<any[]>(`${this.API}/moments/feed`, { headers: this.optionalHeaders() });
  }

  toggleMomentLike(eventId: string, momentId: string) {
    return this.http.post<{ liked: boolean; likesCount: number }>(`${this.API}/${eventId}/moments/${momentId}/like`, {}, { headers: this.headers() });
  }

  addMomentComment(eventId: string, momentId: string, text: string) {
    return this.http.post<{ authorName: string; text: string; createdAt: string }>(`${this.API}/${eventId}/moments/${momentId}/comments`, { text }, { headers: this.headers() });
  }

  getAll() {
    return this.http.get<Event[]>(this.API, { headers: this.headers() });
  }

  getOne(id: string) {
    return this.http.get<Event>(`${this.API}/${id}`, { headers: this.headers() });
  }

  create(data: Partial<Event>) {
    return this.http.post<Event>(this.API, data, { headers: this.headers() });
  }

  update(id: string, data: Partial<Event>) {
    return this.http.put<Event>(`${this.API}/${id}`, data, { headers: this.headers() });
  }

  uploadCover(id: string, file: File) {
    const fd = new FormData();
    fd.append('cover', file);
    return this.http.post<Event>(`${this.API}/${id}/cover`, fd, { headers: this.fileHeaders() });
  }

  uploadMoment(id: string, file: File, caption: string, postedBy: string, taggedVendors: string = '') {
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', caption);
    fd.append('postedBy', postedBy);
    fd.append('taggedVendors', taggedVendors);
    return this.http.post<Event>(`${this.API}/${id}/moments`, fd, { headers: this.fileHeaders() });
  }

  saveSeating(id: string, tables: any[]) {
    return this.http.put<Event>(`${this.API}/${id}/seating`, { tables }, { headers: this.headers() });
  }

  getInvite(token: string) {
    return this.http.get<{ event: Event; guest: any }>(`${this.API}/invite/${token}`);
  }

  verifyAsoebiPayment(token: string, itemName: string, quantity: number, reference: string) {
    return this.http.post<{ success: boolean }>(`${this.API}/invite/${token}/asoebi/verify`, { itemName, quantity, reference });
  }

  verifyGift(token: string, amount: number, reference: string) {
    return this.http.post<{ success: boolean }>(`${this.API}/invite/${token}/gift/verify`, { amount, reference });
  }

  delete(id: string) {
    return this.http.delete(`${this.API}/${id}`, { headers: this.headers() });
  }
}