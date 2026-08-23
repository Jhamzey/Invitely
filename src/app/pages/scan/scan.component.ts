import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {
  eventId = '';
  event!: Event;
  manualCode = '';
  scanResult: any = null;
  scanning = false;
  history: any[] = [];
  stats = { total: 0, arrivedCount: 0, pending: 0 };

  // Session management
  activeSession: any = null;
  sessionUrl = '';
  sessionQR = '';
  creatingSession = false;
  sessionDuration = 24;
  showSessionPanel = false;

  private API = 'http://localhost:4000/api';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getOne(this.eventId).subscribe(e => this.event = e);
    this.loadHistory();
    this.checkActiveSession();
  }

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  checkActiveSession() {
    this.http.get<any>(`${this.API}/scan/session/event/${this.eventId}`, { headers: this.headers() }).subscribe({
      next: session => { this.activeSession = session; if (session) { this.sessionUrl = `${window.location.origin}/scan/session/${session.sessionToken}`; } },
      error: () => {}
    });
  }

  createSession() {
    this.creatingSession = true;
    this.http.post<any>(`${this.API}/scan/session/create`, {
      eventId: this.eventId,
      durationHours: this.sessionDuration
    }, { headers: this.headers() }).subscribe({
      next: data => {
        this.activeSession = data.session;
        this.sessionUrl = data.sessionUrl;
        this.sessionQR = data.session.sessionQR;
        this.creatingSession = false;
        this.showSessionPanel = true;
      },
      error: () => this.creatingSession = false
    });
  }

  terminateSession() {
    if (!this.activeSession || !confirm('Terminate this scan session? The security device will lose access.')) return;
    this.http.delete(`${this.API}/scan/session/${this.activeSession._id}`, { headers: this.headers() }).subscribe({
      next: () => { this.activeSession = null; this.sessionUrl = ''; this.sessionQR = ''; this.showSessionPanel = false; }
    });
  }

  copySessionLink() {
    navigator.clipboard.writeText(this.sessionUrl);
  }

  verify(code: string) {
    if (!code.trim()) return;
    this.scanning = true;
    this.scanResult = null;
    this.http.post<any>(`${this.API}/scan/verify`, { qrCode: code.trim(), eventId: this.eventId }, { headers: this.headers() }).subscribe({
      next: result => {
        this.scanResult = result;
        this.scanning = false;
        if (result.valid) { this.loadHistory(); this.manualCode = ''; }
        setTimeout(() => this.scanResult = null, 4000);
      },
      error: () => { this.scanning = false; this.scanResult = { valid: false, reason: 'error', message: 'Scan failed.' }; }
    });
  }

  loadHistory() {
    this.http.get<any>(`${this.API}/scan/live/${this.eventId}`, { headers: this.headers() }).subscribe({
      next: data => { this.history = data.arrived; this.stats = data.stats; },
      error: () => {}
    });
  }

  get sessionTimeLeft(): string {
    if (!this.activeSession?.expiresAt) return '';
    const diff = new Date(this.activeSession.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m left`;
  }
}