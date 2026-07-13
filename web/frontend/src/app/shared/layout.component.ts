import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  /** 'all' = any logged-in user, 'admin' = admins only. */
  scope: 'all' | 'admin';
  exact?: boolean;
}

/**
 * FaithfulC shell: brand header + top nav on desktop, a fixed bottom tab bar on
 * mobile (≤768px). "FaithfulC" renders on every authenticated page; the Settings
 * entry is only shown to admins.
 * SMOKE_MARKER: FaithfulC
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  private readonly allNav: NavItem[] = [
    { label: 'My Recipes', icon: '📖', link: '/', scope: 'all', exact: true },
    { label: 'Add Recipe', icon: '➕', link: '/recipes/new', scope: 'all' },
    { label: 'Settings', icon: '⚙️', link: '/admin/settings', scope: 'admin' },
  ];

  readonly nav = computed<NavItem[]>(() => {
    const admin = this.auth.isAdmin();
    return this.allNav.filter((n) => (n.scope === 'admin' ? admin : true));
  });

  // Bottom-tab nav shows at most 5 primary items on mobile.
  readonly bottomNav = computed<NavItem[]>(() => this.nav().slice(0, 5));

  readonly userName = computed(
    () => this.auth.user()?.name || this.auth.user()?.email || 'Account',
  );
  readonly roleLabel = computed(() => (this.auth.isAdmin() ? 'Admin' : 'Cook'));

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // Hydrate the header/nav from the live authenticated user
    // (GET /auth/refresh-token). Demo Mode no-ops; errors keep the cached user.
    if (this.auth.isLoggedIn()) {
      this.auth.refresh().subscribe({ error: () => {} });
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
