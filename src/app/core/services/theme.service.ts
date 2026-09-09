import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Theme {
  id: string;
  label: string;
  dataTheme: string;
  accentColor: string;
  previewBg: string;
  previewColor: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly themes: Theme[] = [
    { id: 'ivory', label: 'Ivory Classic', dataTheme: '', accentColor: '#8B7355', previewBg: 'linear-gradient(135deg,#F8F3E8,#E8DFD0)', previewColor: '#3D2E1A' },
    { id: 'gold', label: 'Golden Hour', dataTheme: '', accentColor: '#C9A84C', previewBg: 'linear-gradient(135deg,#2A1F0E,#4A3520)', previewColor: '#F5E6C4' },
    { id: 'lavender', label: 'Lavender Dreams', dataTheme: '', accentColor: '#6B4F8C', previewBg: 'linear-gradient(135deg,#E8E0F0,#D4C8E8)', previewColor: '#2D1F45' },
    { id: 'emerald', label: 'Emerald Garden', dataTheme: '', accentColor: '#2E6B5E', previewBg: 'linear-gradient(135deg,#0D2B20,#1A4A35)', previewColor: '#D4EDE4' },
    { id: 'rose', label: 'Rose Romance', dataTheme: '', accentColor: '#C4546A', previewBg: 'linear-gradient(135deg,#F0E0E5,#E0C5CE)', previewColor: '#3D1020' },
    { id: 'navy', label: 'Midnight Navy', dataTheme: '', accentColor: '#4A7FC0', previewBg: 'linear-gradient(135deg,#0A1628,#1A2D4A)', previewColor: '#C5D8F0' },
  ];

  current = signal<Theme>(this.themes[0]);
  private interval: any;

  isDark = signal<boolean>(this.getStoredDarkMode());

  private getStoredDarkMode(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('invitely_dark') === 'true';
  }

  toggleDarkMode() {
    const next = !this.isDark();
    this.isDark.set(next);
    if (this.isBrowser) localStorage.setItem('invitely_dark', String(next));
    this.applyDarkMode(next);
  }

  applyDarkMode(dark: boolean) {
    if (!this.isBrowser) return;
    if (dark) {
      document.documentElement.setAttribute('data-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-mode');
    }
  }

  initDarkMode() {
    this.applyDarkMode(this.isDark());
  }

  startRotation() {
    if (!this.isBrowser) return;
    document.documentElement.removeAttribute('data-theme');
    let i = 0;
    this.interval = setInterval(() => {
      i = (i + 1) % this.themes.length;
      this.current.set(this.themes[i]);
    }, 15000);
  }

  stopRotation() {
    if (!this.isBrowser) return;
    if (this.interval) clearInterval(this.interval);
    document.documentElement.removeAttribute('data-theme');
    this.applyDarkMode(this.isDark());
  }

  applyTheme(theme: Theme) {
    this.current.set(theme);
  }

  setTheme(id: string) {
    const t = this.themes.find(t => t.id === id);
    if (t) { this.stopRotation(); this.applyTheme(t); }
  }
}