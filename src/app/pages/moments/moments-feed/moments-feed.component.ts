import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { Moment } from '../../../core/models/event.model';

@Component({
  selector: 'app-moments-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './moments-feed.component.html',
  styleUrls: ['./moments-feed.component.css']
})
export class MomentsFeedComponent implements OnInit {
  posts: Moment[] = [];
  loading = true;
  view: 'grid' | 'feed' = 'grid';
  selectedPost: Moment | null = null;
  comment = '';
  commenting = false;

  constructor(public auth: AuthService, private eventService: EventService) {}

  ngOnInit() {
    this.eventService.getMomentsFeed().subscribe({
      next: posts => { this.posts = posts; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  like(post: Moment) {
    if (!this.auth.isLoggedIn() || !post.eventId || !post._id) return;
    const wasLiked = !!post.liked;
    post.liked = !wasLiked;
    post.likesCount += post.liked ? 1 : -1;
    this.eventService.toggleMomentLike(post.eventId, post._id).subscribe({
      error: () => { post.liked = wasLiked; post.likesCount += wasLiked ? 1 : -1; }
    });
  }

  addComment(post: Moment) {
    if (!this.auth.isLoggedIn() || !this.comment.trim() || this.commenting || !post.eventId || !post._id) return;
    this.commenting = true;
    this.eventService.addMomentComment(post.eventId, post._id, this.comment.trim()).subscribe({
      next: c => {
        post.comments = [...(post.comments || []), c];
        post.commentsCount = (post.commentsCount || 0) + 1;
        this.comment = '';
        this.commenting = false;
      },
      error: () => { this.commenting = false; }
    });
  }

  openPost(post: Moment) { this.selectedPost = post; }
  closePost() { this.selectedPost = null; }
}