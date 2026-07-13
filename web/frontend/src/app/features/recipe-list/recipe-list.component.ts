import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { RecipeCard } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';

/**
 * Recipe box home. Renders the signed-in cook's recipes as cards (title +
 * favorite star). Search term and the favorites filter are mirrored to the URL
 * (?q= and ?favorite=1) so a filtered list is deep-linkable. Card tap opens the
 * detail view; the star toggles favorite in place.
 */
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit {
  // Live data: populated from GET /api/recipes in ngOnInit(). Search + favorite
  // filtering are applied client-side over the full owned set so favoriteCount
  // and the empty-state stay accurate.
  readonly recipes = signal<RecipeCard[]>([]);

  readonly query = signal('');
  readonly favoritesOnly = signal(false);

  readonly filtered = computed<RecipeCard[]>(() => {
    const q = this.query().trim().toLowerCase();
    const favOnly = this.favoritesOnly();
    return this.recipes().filter((r) => {
      if (favOnly && !r.isFavorite) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  readonly favoriteCount = computed(() => this.recipes().filter((r) => r.isFavorite).length);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
  ) {}

  ngOnInit(): void {
    // Restore filter state from the URL so the list is deep-linkable.
    const params = this.route.snapshot.queryParamMap;
    this.query.set(params.get('q') ?? '');
    this.favoritesOnly.set(params.get('favorite') === '1');
    this.load();
  }

  /** Fetch the signed-in cook's full recipe box (GET /api/recipes). */
  private load(): void {
    this.recipeService.list().subscribe({
      next: (cards) => this.recipes.set(cards),
      error: () => this.recipes.set([]),
    });
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.syncUrl();
  }

  toggleFavoritesFilter(): void {
    this.favoritesOnly.update((v) => !v);
    this.syncUrl();
  }

  clearSearch(): void {
    this.query.set('');
    this.syncUrl();
  }

  resetFilters(): void {
    this.query.set('');
    this.favoritesOnly.set(false);
    this.syncUrl();
  }

  /** Toggle a card's favorite flag (→ PATCH /api/recipes/:id/favorite). */
  toggleFavorite(card: RecipeCard, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    // Optimistic flip; revert if the server rejects so the UI never desyncs.
    const previous = card.isFavorite;
    this.applyFavorite(card.id, !previous);
    this.recipeService.toggleFavorite(card.id).subscribe({
      next: (res) => this.applyFavorite(card.id, res.isFavorite),
      error: () => this.applyFavorite(card.id, previous),
    });
  }

  private applyFavorite(id: string, isFavorite: boolean): void {
    this.recipes.update((list) =>
      list.map((r) => (r.id === id ? { ...r, isFavorite } : r)),
    );
  }

  open(card: RecipeCard): void {
    this.router.navigate(['/recipes', card.id]);
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query().trim() || null,
        favorite: this.favoritesOnly() ? 1 : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
