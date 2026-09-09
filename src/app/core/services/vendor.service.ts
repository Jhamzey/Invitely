import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Vendor } from '../models/vendor.model';
import { Review } from '../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private API = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getAll(filters?: { category?: string; city?: string; q?: string }) {
    let params = '';
    if (filters) {
      const p = new URLSearchParams();
      if (filters.category && filters.category !== 'all') p.set('category', filters.category);
      if (filters.city) p.set('city', filters.city);
      if (filters.q) p.set('q', filters.q);
      params = p.toString() ? '?' + p.toString() : '';
    }
    return this.http.get<Vendor[]>(`${this.API}${params}`);
  }

  getById(id: string) { return this.http.get<Vendor>(`${this.API}/${id}`); }

  create(data: Partial<Vendor>) {
    return this.http.post<Vendor>(this.API, data, { headers: this.headers() });
  }

  getReviews(vendorId: string) {
    return this.http.get<Review[]>(`${environment.apiUrl}/reviews/vendor/${vendorId}`);
  }

  submitReview(vendorId: string, data: { rating: number; comment: string }) {
    return this.http.post<{ success: boolean; rating: number; reviewCount: number }>(
      `${environment.apiUrl}/reviews/vendor/${vendorId}`, data, { headers: this.headers() }
    );
  }

  getFavorites() {
    return this.http.get<Vendor[]>(`${environment.apiUrl}/users/favorites`, { headers: this.headers() });
  }

  addFavorite(vendorId: string) {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/users/favorites/${vendorId}`, {}, { headers: this.headers() });
  }

  removeFavorite(vendorId: string) {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/users/favorites/${vendorId}`, { headers: this.headers() });
  }
}