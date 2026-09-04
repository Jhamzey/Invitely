import { Component, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const google: any;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mp-wrap">
      <div class="mp-search-row">
        <input #searchInput class="mp-search" placeholder="Search or type address..." />
        <span class="mp-hint">Or click the map to pin exact location</span>
      </div>
      <div #mapEl class="mp-map"></div>
      <div class="mp-result" *ngIf="selectedAddress">
        <span>📍 {{ selectedAddress }}</span>
        <button class="btn btn-outline mp-confirm" (click)="confirm()">Use this location</button>
      </div>
    </div>
  `,
  styles: [`
    .mp-wrap { display: flex; flex-direction: column; gap: 8px; }
    .mp-search-row { display: flex; flex-direction: column; gap: 4px; }
    .mp-search { width: 100%; font-size: 13px; padding: 8px 12px; border-radius: 8px; border: 0.5px solid var(--border-strong); background: var(--surface-1); color: var(--text-primary); outline: none; }
    .mp-search:focus { border-color: var(--accent); }
    .mp-hint { font-size: 11px; color: var(--text-muted); font-family: var(--sans); }
    .mp-map { width: 100%; height: 240px; border-radius: 10px; border: 0.5px solid var(--border); overflow: hidden; }
    .mp-result { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--surface-2); border-radius: 8px; padding: 8px 12px; font-size: 12px; font-family: var(--sans); color: var(--text-primary); }
    .mp-confirm { font-size: 12px; padding: 5px 12px; flex-shrink: 0; }
  `]
})
export class MapPickerComponent implements AfterViewInit {
  @ViewChild('mapEl') mapEl!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  @Output() locationSelected = new EventEmitter<{ address: string; lat: number; lng: number }>();

  selectedAddress = '';
  selectedLat = 0;
  selectedLng = 0;
  private map: any;
  private marker: any;

  ngAfterViewInit() {
    if (typeof google === 'undefined') return;

    this.map = new google.maps.Map(this.mapEl.nativeElement, {
      center: { lat: 6.5244, lng: 3.3792 }, // Lagos default
      zoom: 13,
      styles: [],
      backgroundColor: '#ffffff',
      mapTypeControl: false,
      //styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
    });

    this.map.addListener('click', (e: any) => {
      this.placeMarker(e.latLng.lat(), e.latLng.lng());
      this.reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });

    const autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
      componentRestrictions: { country: ['ng', 'gb', 'us', 'gh', 'ke', 'za'] }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      this.map.setCenter({ lat, lng });
      this.map.setZoom(16);
      this.placeMarker(lat, lng);
      this.selectedAddress = place.formatted_address;
      this.selectedLat = lat;
      this.selectedLng = lng;
    });
  }

  private placeMarker(lat: number, lng: number) {
    if (this.marker) this.marker.setMap(null);
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#C9A84C',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 10
      }
    });
    this.selectedLat = lat;
    this.selectedLng = lng;
  }

  private reverseGeocode(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
      if (status === 'OK' && results[0]) {
        this.selectedAddress = results[0].formatted_address;
      }
    });
  }

  confirm() {
    this.locationSelected.emit({
      address: this.selectedAddress,
      lat: this.selectedLat,
      lng: this.selectedLng
    });
  }
}