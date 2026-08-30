import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  hidden = false;

  // Routes where navbar should NOT show (they have their own nav/header)
  private readonly hiddenRoutes = ['/', '/auth/login', '/auth/register', '/vendor/register'];
  private readonly hiddenPrefixes = ['/invite/', '/scan/session/', '/admin'];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.hidden = this.hiddenRoutes.includes(url) ||
        this.hiddenPrefixes.some(p => url.startsWith(p));
      this.mobileMenuOpen = false;
    });
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.mobileMenuOpen = false; }

  logout() { this.auth.logout(); this.mobileMenuOpen = false; }
}