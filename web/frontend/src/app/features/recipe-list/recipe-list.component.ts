import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeInput } from '../../core/models';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent, RecipeFormComponent, EmptyStateComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit, OnDestroy {
  private readonly recipeService = inject(RecipeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly search = signal('');
  private readonly favoritesOnly = signal(false);

  /** Local text bound to the search box (kept in sync with ?q via debounce). */
  searchText = '';
  modalOpen = signal(false);

  private readonly searchInput$ = new Subject<string>();
  private sub = new Subscription();

  // Recipes are filtered server-side (DB, index-backed); the store signal already
  // holds only the rows matching the current search + favorites query params.
  readonly visibleRecipes = computed(() => this.recipeService.recipes());
  readonly totalCount = computed(() => this.recipeService.recipes().length);
  readonly hasQuery = computed(() => this.search().trim().length > 0 || this.favoritesOnly());

  get favoritesActive(): boolean {
    return this.favoritesOnly();
  }

  ngOnInit(): void {
    // Reload from the backend whenever the search / favorites query params change
    // (fires immediately with the current params → covers the initial load too),
    // so filtering is performed DB-side rather than in-memory.
    this.sub.add(
      this.route.queryParamMap.subscribe((params) => {
        const q = params.get('q') ?? '';
        this.search.set(q);
        this.searchText = q;
        this.favoritesOnly.set(params.get('fav') === '1');
        this.modalOpen.set(params.get('modal') === 'new');
        this.reload();
      }),
    );

    this.sub.add(
      this.searchInput$
        .pipe(debounceTime(250), distinctUntilChanged())
        .subscribe((value) => this.applyQueryParam('q', value.trim() || null)),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.searchText = value;
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyQueryParam('q', null);
  }

  toggleFavoritesFilter(): void {
    this.applyQueryParam('fav', this.favoritesOnly() ? null : '1');
  }

  openAddModal(): void {
    this.applyQueryParam('modal', 'new');
  }

  closeModal(): void {
    this.applyQueryParam('modal', null);
  }

  onFavorite(id: string): void {
    // Reload after the toggle so the server-side favorites filter stays accurate
    // (an un-favorited recipe must drop out while the filter is on).
    this.sub.add(
      this.recipeService.toggleFavorite(id).subscribe({
        next: () => this.reload(),
        error: () => undefined,
      }),
    );
  }

  createRecipe(input: RecipeInput): void {
    this.sub.add(
      this.recipeService.create(input).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
        },
        error: () => undefined,
      }),
    );
  }

  /** Fetch the recipe list from the backend with the current search + favorites filter. */
  private reload(): void {
    this.sub.add(
      this.recipeService
        .refresh(this.search(), this.favoritesOnly())
        .subscribe({ error: () => undefined }),
    );
  }

  private applyQueryParam(key: string, value: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
    });
  }
}
