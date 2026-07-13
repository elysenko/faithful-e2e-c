import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SystemSetting } from '../models';
import { environment } from '../../../environments/environment';

/**
 * Admin-settings store backed by GET/PATCH /api/admin/settings. The `settings`
 * signal holds masked config rows returned by the server; `patch` persists a
 * single key and refreshes the signal from the response.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/settings`;

  readonly settings = signal<SystemSetting[]>([]);

  /** GET /api/admin/settings — load masked config rows. */
  refresh(): Observable<SystemSetting[]> {
    return this.http.get<SystemSetting[]>(this.base).pipe(tap((list) => this.settings.set(list)));
  }

  /** PATCH /api/admin/settings — upsert one key and refresh the signal. */
  patch(key: string, value: string): void {
    this.http.patch<SystemSetting[]>(this.base, { [key]: value }).subscribe({
      next: (list) => this.settings.set(list),
      error: () => undefined,
    });
  }
}
