import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { SystemSetting } from '../../core/models';

interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  keys: string[];
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;

  ngOnInit(): void {
    this.settingsService.refresh().subscribe({ error: () => undefined });
  }

  /** Draft values keyed by setting key (only sent on save). */
  drafts: Record<string, string> = {};
  savedKey: string | null = null;

  readonly groups: ServiceGroup[] = [
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Primary database connection for users and recipes.',
      keys: ['DATABASE_URL', 'JWT_SECRET'],
    },
    {
      id: 'minio',
      name: 'MinIO',
      description: 'Object storage for future recipe image uploads.',
      keys: ['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'],
    },
  ];

  readonly configuredCount = computed(() => this.settings().filter((s) => s.configured).length);

  settingFor(key: string): SystemSetting | undefined {
    return this.settings().find((s) => s.key === key);
  }

  groupConfigured(group: ServiceGroup): boolean {
    return group.keys.every((k) => this.settingFor(k)?.configured);
  }

  save(key: string): void {
    const value = this.drafts[key] ?? '';
    this.settingsService.patch(key, value);
    this.drafts[key] = '';
    this.savedKey = key;
  }
}
