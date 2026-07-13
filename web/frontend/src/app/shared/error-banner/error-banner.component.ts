import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.css',
})
export class ErrorBannerComponent {
  private readonly notify = inject(NotificationService);
  readonly message = this.notify.message;

  dismiss(): void {
    this.notify.clear();
  }
}
