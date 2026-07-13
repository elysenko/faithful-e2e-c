import { Injectable, signal } from '@angular/core';

/**
 * Holds the global error-banner message. The API client (service_agent) will call
 * `showServiceUnavailable()` on a 503 response and `clear()` once a request succeeds.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<string | null>(null);

  showServiceUnavailable(): void {
    this.message.set('Service temporarily unavailable. Please try again in a moment.');
  }

  show(message: string): void {
    this.message.set(message);
  }

  clear(): void {
    this.message.set(null);
  }
}
