import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Event } from '../models/event.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class EventService {
  private API = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // JSON headers only
  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // File headers — no Content-Type (let browser set multipart boundary)
  private fileHeaders() {
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
    // FIX: use fileHeaders() — no Content-Type override
    return this.http.post<Event>(`${this.API}/${id}/cover`, fd, { headers: this.fileHeaders() });
  }

  uploadMoment(id: string, file: File, caption: string, postedBy: string) {
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', caption);
    fd.append('postedBy', postedBy);
    // FIX: use fileHeaders()
    return this.http.post<Event>(`${this.API}/${id}/moments`, fd, { headers: this.fileHeaders() });
  }

  saveSeating(id: string, tables: any[]) {
    return this.http.put<Event>(`${this.API}/${id}/seating`, { tables }, { headers: this.headers() });
  }

  getInvite(token: string) {
    return this.http.get<{ event: Event; guest: any }>(`${this.API}/invite/${token}`);
  }

  delete(id: string) {
    return this.http.delete(`${this.API}/${id}`, { headers: this.headers() });
  }
}