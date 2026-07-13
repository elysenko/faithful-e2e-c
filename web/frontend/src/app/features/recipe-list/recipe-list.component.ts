import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { RecipeCard } from '../../core/models';

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
  // Data contract: mock cards live in an array signal so the pipeline can clear
  // this and wire GET /api/recipes in ngOnInit().
  readonly recipes = signal<RecipeCard[]>([
    { id: 'r1', title: 'Weeknight Tomato Basil Pasta', isFavorite: true },
    { id: 'r2', title: 'Grandma’s Cinnamon Rolls', isFavorite: true },
    { id: 'r3', title: 'Smoky Black Bean Tacos', isFavorite: false },
    { id: 'r4', title: 'Lemon Herb Roast Chicken', isFavorite: true },
    { id: 'r5', title: 'Creamy Mushroom Risotto', isFavorite: false },
    { id: 'r6', title: 'Overnight Oats with Berries', isFavorite: false },
    { id: 'r7', title: 'Thai Green Curry', isFavorite: false },
    { id: 'r8', title: 'Chewy Chocolate Chip Cookies', isFavorite: true },
  ]);

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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Restore filter state from the URL so the list is deep-linkable.
    const params = this.route.snapshot.queryParamMap;
    this.query.set(params.get('q') ?? '');
    this.favoritesOnly.set(params.get('favorite') === '1');
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
    this.recipes.update((list) =>
      list.map((r) => (r.id === card.id ? { ...r, isFavorite: !r.isFavorite } : r)),
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
