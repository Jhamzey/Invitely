import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  private API = environment.apiUrl;
  status: any = { status: 'unsubmitted' };
  loading = true;

  idType = '';
  idNumber = '';
  selfieFile: File | null = null;
  idDocFile: File | null = null;
  selfiePreview = '';
  idDocPreview = '';
  submitting = false;
  error = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.http.get<any>(`${this.API}/verification/status`, { headers: this.headers() }).subscribe({
      next: s => { this.status = s; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSelfieSelected(e: any) {
    this.selfieFile = e.target.files?.[0] || null;
    if (this.selfieFile) this.selfiePreview = URL.createObjectURL(this.selfieFile);
  }

  onIdDocSelected(e: any) {
    this.idDocFile = e.target.files?.[0] || null;
    if (this.idDocFile) this.idDocPreview = URL.createObjectURL(this.idDocFile);
  }

  submit() {
    if (!this.idType || !this.idNumber || !this.selfieFile || !this.idDocFile) {
      this.error = 'Please fill in every field and attach both photos.';
      return;
    }
    this.submitting = true;
    this.error = '';
    const fd = new FormData();
    fd.append('idType', this.idType);
    fd.append('idNumber', this.idNumber);
    fd.append('selfie', this.selfieFile);
    fd.append('idDoc', this.idDocFile);

    this.http.post<any>(`${this.API}/verification/submit`, fd, { headers: this.headers() }).subscribe({
      next: s => { this.status = s; this.submitting = false; },
      error: err => { this.error = err.error?.error || 'Could not submit. Please try again.'; this.submitting = false; }
    });
  }
}