import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-contact-disclaimer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cd-overlay" (click)="cancel.emit()">
      <div class="cd-modal" (click)="$event.stopPropagation()">
        <h3 class="cd-title">Before you leave Innvitely</h3>
        <p class="cd-body">
          You're about to contact <strong>{{ vendorName }}</strong> outside the app via {{ method }}.
          This vendor is registered on Innvitely{{ verified ? ' and verified' : '' }}, but conversations and
          payments made outside the app aren't monitored or protected by us. Never send full payment
          upfront to someone you haven't met or verified independently, and be cautious of deals that
          feel rushed or too good to be true.
        </p>
        <label class="cd-checkbox">
          <input type="checkbox" [(ngModel)]="dontShowAgain" name="dontShowAgain" />
          Don't show this again
        </label>
        <div class="cd-actions">
          <button class="btn btn-outline" (click)="cancel.emit()">Cancel</button>
          <button class="btn btn-primary" (click)="proceed.emit(dontShowAgain)">Continue to {{ method }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .cd-modal { background: #fff; border-radius: 12px; padding: 1.5rem; max-width: 26rem; width: 100%; }
    .cd-title { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .cd-body { color: #5b4a36; font-size: 0.92rem; line-height: 1.5; margin-bottom: 1rem; }
    .cd-checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 1.25rem; }
    .cd-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
  `]
})
export class ContactDisclaimerComponent {
  @Input() vendorName = 'this vendor';
  @Input() method: 'WhatsApp' | 'phone call' = 'WhatsApp';
  @Input() verified = false;
  @Output() proceed = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  dontShowAgain = false;
}