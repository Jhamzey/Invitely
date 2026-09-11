import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { Event, Moment } from '../../core/models/event.model';

@Component({
  selector: 'app-moments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './moments.component.html',
  styleUrls: ['./moments.component.css']
})
export class MomentsComponent implements OnInit {
  eventId = '';
  event!: Event;
  loading = true;
  view: 'grid' | 'feed' = 'grid';
  uploading = false;
  showUpload = false;
  uploadCaption = '';
  uploadFiles: File[] = [];
  uploadPreviews: string[] = [];
  selectedMoment: Moment | null = null;
  selectedIdx = 0;
  tagInput = '';
  uploadProgress = 0;
  uploadError = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.loading = true;
    this.eventService.getOne(this.eventId).subscribe({
      next: e => { this.event = e; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get moments(): Moment[] { return this.event?.moments || []; }

  // Multiple file selection — all formats accepted
  onFilesSelected(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    this.uploadFiles = [...this.uploadFiles, ...files];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = r => this.uploadPreviews.push(r.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeFile(i: number) {
    this.uploadFiles.splice(i, 1);
    this.uploadPreviews.splice(i, 1);
  }

  async upload() {
    if (!this.uploadFiles.length) return;
    this.uploading = true;
    this.uploadError = '';
    this.uploadProgress = 0;

    try {
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.uploadProgress = Math.round(((i + 1) / this.uploadFiles.length) * 100);
        await new Promise<void>((resolve, reject) => {
          this.eventService.uploadMoment(
            this.eventId,
            this.uploadFiles[i],
            i === 0 ? this.uploadCaption : '',
            this.auth.user()?.name || 'Host',
            i === 0 ? this.tagInput : ''
          ).subscribe({
            next: e => { this.event = e; resolve(); },
            error: err => reject(err)
          });
        });
      }
      // All uploaded
      this.showUpload = false;
      this.uploadFiles = [];
      this.uploadPreviews = [];
      this.uploadCaption = '';
      this.uploadProgress = 0;
      this.tagInput = '';
    } catch {
      this.uploadError = 'Some files failed to upload. Please try again.';
    } finally {
      this.uploading = false;
    }
  }

  openMoment(m: Moment, i: number) { this.selectedMoment = m; this.selectedIdx = i; }
  closeMoment() { this.selectedMoment = null; }
  prevMoment() { if (this.selectedIdx > 0) { this.selectedIdx--; this.selectedMoment = this.moments[this.selectedIdx]; } }
  nextMoment() { if (this.selectedIdx < this.moments.length - 1) { this.selectedIdx++; this.selectedMoment = this.moments[this.selectedIdx]; } }
}