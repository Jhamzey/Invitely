import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-moments-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './moments-feed.component.html',
  styleUrls: ['./moments-feed.component.css']
})
export class MomentsFeedComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  view: 'grid' | 'feed' = 'grid';
  selectedPost: any = null;
  comment = '';

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    // Load all public moments from all events
    setTimeout(() => {
      // Placeholder — real data comes from backend
      this.posts = [];
      this.loading = false;
    }, 500);
  }

  like(post: any) {
    if (!this.auth.isLoggedIn()) return;
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }

  addComment(post: any) {
    if (!this.auth.isLoggedIn() || !this.comment.trim()) return;
    post.comments = post.comments || [];
    post.comments.push({ author: this.auth.user()?.name, text: this.comment, time: 'Just now' });
    this.comment = '';
  }
}