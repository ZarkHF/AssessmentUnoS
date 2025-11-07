import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <button class="confirm-btn" (click)="onConfirm()">Yes</button>
          <button class="cancel-btn" (click)="onCancel()">No</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 206, 209, 0.15);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .dialog-container {
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      min-width: 300px;
      max-width: 90%;
      box-shadow: 0 8px 16px rgba(0, 206, 209, 0.1);
      border: 2px solid rgba(0, 206, 209, 0.2);
      position: relative;
    }

    .dialog-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #00CED1;
      border-radius: 12px 12px 0 0;
    }

    h2 {
      margin: 0 0 15px 0;
      color: #008B8B;
      font-size: 1.8em;
      font-weight: 600;
    }

    p {
      margin: 0 0 20px 0;
      color: #2C7A7B;
      font-size: 1.1em;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95em;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .confirm-btn {
      background: rgba(239, 68, 68, 0.15);
      color: #DC2626;
    }

    .confirm-btn:hover {
      background: rgba(239, 68, 68, 0.25);
      transform: translateY(-1px);
    }

    .cancel-btn {
      background: rgba(0, 206, 209, 0.1);
      color: #008B8B;
    }

    .cancel-btn:hover {
      background: rgba(0, 206, 209, 0.2);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
