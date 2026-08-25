import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
export class ScanComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  eventId = '';
  event!: Event;
  manualCode = '';
  scanResult: any = null;
  scanning = false;
  history: any[] = [];
  stats = { total: 0, arrivedCount: 0, pending: 0 };

  // Camera
  cameraActive = false;
  cameraError = '';
  private cameraStream: MediaStream | null = null;
  private barcodeInterval: any;

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

  ngOnDestroy() {
    this.stopCamera();
    clearInterval(this.barcodeInterval);
  }

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  async startCamera() {
    this.cameraError = '';
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.cameraActive = true;
      setTimeout(() => {
        if (this.videoEl?.nativeElement) {
          this.videoEl.nativeElement.srcObject = this.cameraStream!;
          this.videoEl.nativeElement.play();
          this.startBarcodeDetection();
        }
      }, 200);
    } catch (err: any) {
      this.cameraError = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access.'
        : 'Unable to open camera. Use the manual input below.';
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
    if (!('BarcodeDetector' in window)) return;
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    const video = this.videoEl.nativeElement;
    this.barcodeInterval = setInterval(async () => {
      if (!video.videoWidth || this.scanning) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) this.verify(codes[0].rawValue);
      } catch {}
    }, 400);
  }

  verify(code?: string) {
    const qrCode = (code || this.manualCode).trim();
    if (!qrCode || this.scanning) return;
    this.scanning = true;
    this.scanResult = null;

    this.http.post<any>(`${this.API}/scan/verify`, {
      qrCode, eventId: this.eventId
    }, { headers: this.headers() }).subscribe({
      next: result => {
        this.scanResult = result;
        this.scanning = false;
        this.manualCode = '';
        if (result.valid) { this.loadHistory(); }
        setTimeout(() => this.scanResult = null, 5000);
      },
      error: () => {
        this.scanning = false;
        this.scanResult = { valid: false, reason: 'error', message: 'Network error. Try again.' };
      }
    });
  }

  checkActiveSession() {
    this.http.get<any>(`${this.API}/scan/session/event/${this.eventId}`, { headers: this.headers() }).subscribe({
      next: session => {
        this.activeSession = session;
        if (session) this.sessionUrl = `${window.location.origin}/scan/session/${session.sessionToken}`;
      },
      error: () => {}
    });
  }

  createSession() {
    this.creatingSession = true;
    this.http.post<any>(`${this.API}/scan/session/create`, {
      eventId: this.eventId, durationHours: this.sessionDuration
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
    if (!this.activeSession || !confirm('Terminate this scan session?')) return;
    this.http.delete(`${this.API}/scan/session/${this.activeSession._id}`, { headers: this.headers() }).subscribe({
      next: () => { this.activeSession = null; this.sessionUrl = ''; this.sessionQR = ''; this.showSessionPanel = false; }
    });
  }

  copySessionLink() { navigator.clipboard.writeText(this.sessionUrl); }

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