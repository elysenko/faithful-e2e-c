import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe, RecipeInput } from '../../core/models';
import { parseFormError } from '../../core/http-error';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { FavoriteToggleComponent } from '../../shared/favorite-toggle/favorite-toggle.component';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeFormComponent, FavoriteToggleComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  private readonly recipeService = inject(RecipeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = signal<string>('');
  readonly recipe = signal<Recipe | undefined>(undefined);
  readonly editing = signal(false);
  readonly confirmingDelete = signal(false);

  /** Server-side validation feedback for the edit form. */
  readonly formError = signal<string | null>(null);
  readonly formFieldErrors = signal<Record<string, string> | null>(null);

  readonly ingredientLines = computed(() => splitLines(this.recipe()?.ingredients));
  readonly stepLines = computed(() => splitLines(this.recipe()?.steps));

  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id') ?? '';
        this.id.set(id);
        this.load(id);
      }),
    );
    this.sub.add(
      this.route.queryParamMap.subscribe((params) =>
        this.editing.set(params.get('edit') === '1'),
      ),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private load(id: string): void {
    if (!id) {
      this.recipe.set(undefined);
      return;
    }
    this.recipeService.getOne(id).subscribe({
      next: (recipe) => this.recipe.set(recipe),
      // 404 (and any other failure) → no recipe → template shows "not found".
      error: () => this.recipe.set(undefined),
    });
  }

  startEdit(): void {
    this.setEditParam('1');
  }

  cancelEdit(): void {
    this.formError.set(null);
    this.formFieldErrors.set(null);
    this.setEditParam(null);
  }

  saveEdit(input: RecipeInput): void {
    this.formError.set(null);
    this.formFieldErrors.set(null);
    this.recipeService.update(this.id(), input).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.setEditParam(null);
      },
      // Surface the backend's { error, fields } response as inline edit-form
      // errors instead of silently dropping it (a DB 503 flows to the banner).
      error: (err: HttpErrorResponse) => {
        if (err?.status === 503) return;
        const parsed = parseFormError(err);
        this.formFieldErrors.set(parsed.fields);
        this.formError.set(parsed.message);
      },
    });
  }

  toggleFavorite(): void {
    this.recipeService.toggleFavorite(this.id()).subscribe({
      next: (recipe) => this.recipe.set(recipe),
      error: () => undefined,
    });
  }

  askDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.recipeService.remove(this.id()).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.confirmingDelete.set(false),
    });
  }

  private setEditParam(value: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: value },
      queryParamsHandling: 'merge',
    });
  }
}

function splitLines(text: string | undefined): string[] {
  return (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}
