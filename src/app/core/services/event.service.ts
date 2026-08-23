import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private API = 'http://localhost:4000/api/events';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
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
    return this.http.post<Event>(`${this.API}/${id}/cover`, fd, { headers: this.headers() });
  }

  uploadMoment(id: string, file: File, caption: string, postedBy: string) {
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', caption);
    fd.append('postedBy', postedBy);
    return this.http.post<Event>(`${this.API}/${id}/moments`, fd, { headers: this.headers() });
  }

  saveSeating(id: string, tables: any[]) {
    return this.http.put<Event>(`${this.API}/${id}/seating`, { tables }, { headers: this.headers() });
  }

  getInvite(token: string) {
    return this.http.get<{ event: Event; guest: any }>(`${this.API}/invite/${token}`);
  }
}