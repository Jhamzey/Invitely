import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  sessionToken = '';
  sessionInfo: any = null;
  loading = true;
  expired = false;
  invalid = false;

  manualCode = '';
  scanning = false;
  scanResult: any = null;
  cameraActive = false;
  cameraError = '';

  arrivals: any[] = [];
  stats = { total: 0, arrivedCount: 0, pending: 0 };

  private pollInterval: any;
  private cameraStream: MediaStream | null = null;
  private barcodeInterval: any;
  private readonly API = 'http://localhost:4000/api/scan';

  offlineQueue: string[] = [];
  isOffline = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.sessionToken = this.route.snapshot.paramMap.get('token')!;
    this.validateSession();
    window.addEventListener('online', () => { this.isOffline = false; this.processOfflineQueue(); });
    window.addEventListener('offline', () => this.isOffline = true);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
    clearInterval(this.barcodeInterval);
    this.stopCamera();
  }

  validateSession() {
    this.http.get<any>(`${this.API}/session/validate/${this.sessionToken}`).subscribe({
      next: info => { this.sessionInfo = info; this.loading = false; this.startPolling(); this.loadLive(); },
      error: () => { this.loading = false; this.invalid = true; }
    });
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      if (new Date(this.sessionInfo.expiresAt) < new Date()) { this.expired = true; clearInterval(this.pollInterval); return; }
      this.loadLive();
    }, 5000);
  }

  loadLive() {
    this.http.get<any>(`${this.API}/live/${this.sessionInfo?.eventId}?sessionToken=${this.sessionToken}`).subscribe({
      next: data => { this.arrivals = data.arrived; this.stats = data.stats; },
      error: () => {}
    });
  }

  async startCamera() {
    this.cameraError = '';
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.cameraActive = true;

      // Give Angular time to render the video element
      setTimeout(() => {
        if (this.videoEl?.nativeElement) {
          this.videoEl.nativeElement.srcObject = this.cameraStream!;
          this.videoEl.nativeElement.play();
          this.startBarcodeDetection();
        }
      }, 200);
    } catch (err: any) {
      this.cameraError = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access and try again.'
        : 'Unable to access camera. Use manual code entry instead.';
    }
  }

  stopCamera() {
    this.cameraActive = false;
    clearInterval(this.barcodeInterval);
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
  }

  private startBarcodeDetection() {
    // Use BarcodeDetector API if available (Chrome 83+, Edge, Android)
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const video = this.videoEl.nativeElement;

      this.barcodeInterval = setInterval(async () => {
        if (!video.videoWidth) return;
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && !this.scanning) {
            this.verify(barcodes[0].rawValue);
          }
        } catch {}
      }, 500);
    }
    // If BarcodeDetector not available, fall back to manual input
  }

  verify(code?: string) {
    const qrCode = (code || this.manualCode).trim();
    if (!qrCode || this.scanning) return;

    if (this.isOffline) {
      this.offlineQueue.push(qrCode);
      this.scanResult = { offline: true };
      this.manualCode = '';
      return;
    }

    this.scanning = true;
    this.scanResult = null;

    this.http.post<any>(`${this.API}/verify`, {
      qrCode,
      eventId: this.sessionInfo.eventId,
      sessionToken: this.sessionToken
    }).subscribe({
      next: result => {
        this.scanResult = result;
        this.scanning = false;
        this.manualCode = '';
        if (result.valid) this.loadLive();
        setTimeout(() => this.scanResult = null, 4000);
      },
      error: err => {
        if (err.error?.code === 'SESSION_EXPIRED') { this.expired = true; this.stopCamera(); return; }
        this.scanning = false;
        this.scanResult = { valid: false, reason: 'error', message: 'Network error.' };
      }
    });
  }

  processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    queue.forEach(code => {
      this.http.post<any>(`${this.API}/verify`, { qrCode: code, eventId: this.sessionInfo.eventId, sessionToken: this.sessionToken }).subscribe();
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