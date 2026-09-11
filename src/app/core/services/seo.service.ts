import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  update(config: { title: string; description?: string; path?: string; image?: string; type?: string }) {
    const fullTitle = config.title.includes('Innvitely') ? config.title : `${config.title} · Innvitely`;
    this.titleService.setTitle(fullTitle);

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    if (config.image) this.meta.updateTag({ property: 'og:image', content: config.image });

    const canonicalUrl = `${environment.siteUrl}${config.path || ''}`;
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.setCanonical(canonicalUrl);
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setJsonLd(id: string, data: object) {
    if (!isPlatformBrowser(this.platformId) && typeof this.doc.createElement !== 'function') return;
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script') as HTMLScriptElement;
      script.id = id;
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  removeJsonLd(id: string) {
    const script = this.doc.getElementById(id);
    if (script) script.remove();
  }
}