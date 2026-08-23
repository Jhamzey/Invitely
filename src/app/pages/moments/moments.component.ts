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
  uploadFile: File | null = null;
  uploadPreview = '';
  selectedMoment: Moment | null = null;
  selectedIdx = 0;

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

  onFileSelected(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    this.uploadFile = file;
    const reader = new FileReader();
    reader.onload = r => this.uploadPreview = r.target?.result as string;
    reader.readAsDataURL(file);
  }

  upload() {
    if (!this.uploadFile) return;
    this.uploading = true;
    this.eventService.uploadMoment(
      this.eventId,
      this.uploadFile,
      this.uploadCaption,
      this.auth.user()?.name || 'Host'
    ).subscribe({
      next: e => {
        this.event = e;
        this.showUpload = false;
        this.uploadFile = null;
        this.uploadPreview = '';
        this.uploadCaption = '';
        this.uploading = false;
      },
      error: () => this.uploading = false
    });
  }

  openMoment(m: Moment, i: number) {
    this.selectedMoment = m;
    this.selectedIdx = i;
  }

  closeMoment() { this.selectedMoment = null; }

  prevMoment() {
    if (this.selectedIdx > 0) {
      this.selectedIdx--;
      this.selectedMoment = this.moments[this.selectedIdx];
    }
  }

  nextMoment() {
    if (this.selectedIdx < this.moments.length - 1) {
      this.selectedIdx++;
      this.selectedMoment = this.moments[this.selectedIdx];
    }
  }
}