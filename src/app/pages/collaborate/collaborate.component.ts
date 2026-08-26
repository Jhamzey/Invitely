import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-collaborate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './collaborate.component.html',
  styleUrls: ['./collaborate.component.css']
})
export class CollaborateComponent implements OnInit {
  eventId = '';
  event: any = null;
  collaboration: any = null;
  loading = true;
  inviteEmail = '';
  inviting = false;
  inviteError = '';
  inviteSuccess = '';

  permissions = { guests: true, seating: true, builder: false, moments: true };

  private API = 'http://localhost:4000/api';

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private http: HttpClient,
    private eventService: EventService
  ) {}

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getOne(this.eventId).subscribe(e => { this.event = e; });
    this.loadCollaboration();
  }

  loadCollaboration() {
    this.loading = true;
    this.http.get<any>(`${this.API}/collaborate/${this.eventId}`, { headers: this.headers() }).subscribe({
      next: c => { this.collaboration = c; this.loading = false; },
      error: () => { this.loading = false; this.collaboration = null; }
    });
  }

  get isPaidPlan(): boolean {
    const plan = this.auth.user()?.plan;
    return plan === 'standard' || plan === 'premium';
  }

  get maxCollaborators(): number {
    return this.auth.user()?.plan === 'premium' ? 999 : 2;
  }

  get collaborators(): any[] {
    return this.collaboration?.collaborators?.filter((c: any) => c.active) || [];
  }

  get canAddMore(): boolean {
    return this.collaborators.length < this.maxCollaborators;
  }

  get activityLog(): any[] {
    return this.collaboration?.activityLog?.slice().reverse().slice(0, 20) || [];
  }

  invite() {
    if (!this.isPaidPlan) { this.inviteError = 'Collaboration requires Standard or Premium plan.'; return; }
    if (!this.canAddMore) { this.inviteError = `Maximum ${this.maxCollaborators} collaborators allowed on your plan.`; return; }
    if (!this.inviteEmail.trim()) { this.inviteError = 'Enter an email address.'; return; }
    this.inviting = true;
    this.inviteError = '';
    this.inviteSuccess = '';

    this.http.post<any>(`${this.API}/collaborate/${this.eventId}/invite`, {
      email: this.inviteEmail,
      permissions: this.permissions
    }, { headers: this.headers() }).subscribe({
      next: c => {
        this.collaboration = c;
        this.inviteSuccess = `Invite sent to ${this.inviteEmail}`;
        this.inviteEmail = '';
        this.inviting = false;
      },
      error: err => {
        this.inviteError = err.error?.error || 'Failed to send invite.';
        this.inviting = false;
      }
    });
  }

  // FIX: remove by email (works whether userId is set or not)
  removeCollaborator(collaboratorEmail: string) {
    if (!confirm('Remove this collaborator? They will lose access immediately.')) return;
    this.http.delete<any>(
      `${this.API}/collaborate/${this.eventId}/collaborator`,
      { headers: this.headers(), body: { email: collaboratorEmail } }
    ).subscribe({
      next: (c: any) => this.collaboration = c,
      error: err => alert(err.error?.error || 'Failed to remove collaborator.')
    });
  }
}