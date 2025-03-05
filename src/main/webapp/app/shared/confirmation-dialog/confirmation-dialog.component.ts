import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="dismiss()">Cancel</button>
      <button type="button" [class]="'btn ' + confirmButtonClass" (click)="confirm()">
        {{ confirmButtonText }}
      </button>
    </div>
  `,
  styles: [
    `
      .modal-header {
        border-bottom: 1px solid var(--bs-border-color);
      }
      .modal-footer {
        border-top: 1px solid var(--bs-border-color);
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to perform this action?';
  @Input() confirmButtonText = 'Confirm';
  @Input() confirmButtonClass = 'btn-primary';

  constructor(private activeModal: NgbActiveModal) {}

  confirm(): void {
    this.activeModal.close(true);
  }

  dismiss(): void {
    this.activeModal.dismiss(false);
  }
}
