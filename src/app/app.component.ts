import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SeoService } from './core/services/seo.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private seoService: SeoService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Init dark mode from localStorage
    this.themeService.initDarkMode();

    // If user lands on '/' while logged in, redirect to their dashboard
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      if (e.urlAfterRedirects === '/' && this.auth.isLoggedIn()) {
        const role = this.auth.user()?.role;
        if (role === 'vendor') {
          this.router.navigate(['/vendor/dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      }
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) child = child.firstChild;
      const data = child?.snapshot.data;
      if (data?.['title']) {
        this.seoService.update({ title: data['title'], description: data['description'], path: this.router.url });
      }
    });
  }
}