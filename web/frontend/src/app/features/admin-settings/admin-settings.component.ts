import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminSetting } from '../../core/models';

interface ServiceGroup {
  service: string;
  label: string;
  icon: string;
  description: string;
  settings: AdminSetting[];
}

/**
 * Admin settings (admins only). Lists each backing service with a
 * configured / not-configured badge and a per-service credential form.
 * Reads GET /api/admin/settings and saves via PATCH /api/admin/settings.
 */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent {
  // Data contract: masked settings live in an array signal so the pipeline can
  // clear this and wire GET /api/admin/settings in ngOnInit().
  readonly settings = signal<AdminSetting[]>([
    { key: 'DATABASE_URL', service: 'postgresql', label: 'Connection URL', value: 'postgres://••••••@app-db:5432/faithfulc', configured: true },
    { key: 'MINIO_ENDPOINT', service: 'minio', label: 'Endpoint', value: '', configured: false },
    { key: 'MINIO_ACCESS_KEY', service: 'minio', label: 'Access key', value: '', configured: false },
    { key: 'MINIO_SECRET_KEY', service: 'minio', label: 'Secret key', value: '', configured: false },
  ]);

  readonly savedService = signal<string | null>(null);

  private readonly meta: Record<string, { label: string; icon: string; description: string }> = {
    postgresql: { label: 'PostgreSQL', icon: '🗄️', description: 'Primary database that stores users and recipes.' },
    minio: { label: 'MinIO', icon: '🪣', description: 'Object storage (provisioned; not yet used by any feature).' },
  };

  readonly groups = signal<ServiceGroup[]>(this.buildGroups());

  private buildGroups(): ServiceGroup[] {
    const byService = new Map<string, AdminSetting[]>();
    for (const s of this.settings()) {
      const arr = byService.get(s.service) ?? [];
      arr.push(s);
      byService.set(s.service, arr);
    }
    return [...byService.entries()].map(([service, settings]) => ({
      service,
      label: this.meta[service]?.label ?? service,
      icon: this.meta[service]?.icon ?? '🔌',
      description: this.meta[service]?.description ?? '',
      settings,
    }));
  }

  isConfigured(group: ServiceGroup): boolean {
    return group.settings.every((s) => s.configured || s.value.trim().length > 0);
  }

  save(group: ServiceGroup): void {
    // Mockup: simulate PATCH /api/admin/settings.
    this.settings.update((list) =>
      list.map((s) =>
        s.service === group.service ? { ...s, configured: s.value.trim().length > 0 || s.configured } : s,
      ),
    );
    this.groups.set(this.buildGroups());
    this.savedService.set(group.service);
  }
}
