import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scan-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-session.component.html',
  styleUrls: ['./scan-session.component.css']
})
export class ScanSessionComponent implements OnInit, OnDestroy {
  sessionToken = '';
  sessionInfo: any = null;
  loading = true;
  expired = false;
  invalid = false;

  manualCode = '';
  scanning = false;
  scanResult: any = null;

  arrivals: any[] = [];
  stats = { total: 0, arrivedCount: 0, pending: 0 };

  private pollInterval: any;
  private readonly API = 'http://localhost:4000/api/scan';

  // Offline queue for bad connectivity
  offlineQueue: string[] = [];
  isOffline = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.sessionToken = this.route.snapshot.paramMap.get('token')!;
    this.validateSession();

    // Listen for online/offline
    window.addEventListener('online', () => { this.isOffline = false; this.processOfflineQueue(); });
    window.addEventListener('offline', () => this.isOffline = true);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  validateSession() {
    this.http.get<any>(`${this.API}/session/validate/${this.sessionToken}`).subscribe({
      next: info => {
        this.sessionInfo = info;
        this.loading = false;
        this.startPolling();
        this.loadLive();
      },
      error: () => {
        this.loading = false;
        this.invalid = true;
      }
    });
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      // Check if expired
      if (new Date(this.sessionInfo.expiresAt) < new Date()) {
        this.expired = true;
        clearInterval(this.pollInterval);
        return;
      }
      this.loadLive();
    }, 5000); // Poll every 5 seconds for real-time updates
  }

  loadLive() {
    this.http.get<any>(`${this.API}/live/${this.sessionInfo?.eventId}?sessionToken=${this.sessionToken}`).subscribe({
      next: data => {
        this.arrivals = data.arrived;
        this.stats = data.stats;
      },
      error: () => {}
    });
  }

  verify() {
    const code = this.manualCode.trim();
    if (!code) return;

    if (this.isOffline) {
      // Queue for later
      this.offlineQueue.push(code);
      this.scanResult = { offline: true, code };
      this.manualCode = '';
      return;
    }

    this.scanning = true;
    this.scanResult = null;

    this.http.post<any>(`${this.API}/verify`, {
      qrCode: code,
      eventId: this.sessionInfo.eventId,
      sessionToken: this.sessionToken
    }).subscribe({
      next: result => {
        this.scanResult = result;
        this.scanning = false;
        this.manualCode = '';
        if (result.valid) this.loadLive();
        // Auto clear result after 4 seconds
        setTimeout(() => this.scanResult = null, 4000);
      },
      error: err => {
        if (err.error?.code === 'SESSION_EXPIRED') { this.expired = true; return; }
        this.scanning = false;
        this.scanResult = { valid: false, reason: 'error', message: 'Network error. Try again.' };
      }
    });
  }

  processOfflineQueue() {
    if (!this.offlineQueue.length) return;
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    queue.forEach(code => {
      this.http.post<any>(`${this.API}/verify`, {
        qrCode: code,
        eventId: this.sessionInfo.eventId,
        sessionToken: this.sessionToken
      }).subscribe();
    });
  }

  get timeLeft(): string {
    if (!this.sessionInfo?.expiresAt) return '';
    const diff = new Date(this.sessionInfo.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m remaining`;
  }
}