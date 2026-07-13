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

  readonly visibleRecipes = computed(() =>
    this.recipeService.query(this.search(), this.favoritesOnly()),
  );
  readonly totalCount = computed(() => this.recipeService.recipes().length);
  readonly hasQuery = computed(() => this.search().trim().length > 0 || this.favoritesOnly());

  get favoritesActive(): boolean {
    return this.favoritesOnly();
  }

  ngOnInit(): void {
    // Load the recipe list from the backend into the store signal.
    this.sub.add(this.recipeService.refresh().subscribe({ error: () => undefined }));

    this.sub.add(
      this.route.queryParamMap.subscribe((params) => {
        const q = params.get('q') ?? '';
        this.search.set(q);
        this.searchText = q;
        this.favoritesOnly.set(params.get('fav') === '1');
        this.modalOpen.set(params.get('modal') === 'new');
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
    this.sub.add(this.recipeService.toggleFavorite(id).subscribe({ error: () => undefined }));
  }

  createRecipe(input: RecipeInput): void {
    this.sub.add(
      this.recipeService.create(input).subscribe({
        next: () => this.closeModal(),
        error: () => undefined,
      }),
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
