import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { ErrorBannerComponent } from '../error-banner/error-banner.component';

/**
 * Authenticated layout shell: FaithfulC header (desktop nav + logout), a mobile bottom
 * tab bar, the global error banner and the routed page outlet. Guarded routes render
 * inside <router-outlet>.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ErrorBannerComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly recipes = inject(RecipeService);

  readonly user = this.auth.user;
  readonly isAdmin = this.auth.isAdmin;
  readonly favoriteCount = this.recipes.favoriteCount;

  logout(): void {
    this.auth.logout();
  }
}
