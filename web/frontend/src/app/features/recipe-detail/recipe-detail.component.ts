import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';

/**
 * Full recipe detail: title, ingredients and steps, plus a favorite toggle and
 * Edit / Delete actions. Loads the recipe via GET /api/recipes/:id; when the id
 * is unknown or not owned (404) a friendly not-found panel is shown instead.
 */
@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent implements OnInit {
  readonly id = signal<string>('');
  readonly recipe = signal<Recipe | undefined>(undefined);
  readonly loaded = signal(false);
  readonly confirmingDelete = signal(false);

  readonly ingredientLines = computed<string[]>(() =>
    (this.recipe()?.ingredients ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
  );
  readonly stepLines = computed<string[]>(() =>
    (this.recipe()?.steps ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.id.set(id);
    this.recipeService.get(id).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.loaded.set(true);
      },
      error: () => {
        this.recipe.set(undefined);
        this.loaded.set(true);
      },
    });
  }

  toggleFavorite(): void {
    const current = this.recipe();
    if (!current) return;
    // Optimistic flip; revert on server error.
    const previous = current.isFavorite;
    this.recipe.set({ ...current, isFavorite: !previous });
    this.recipeService.toggleFavorite(current.id).subscribe({
      next: (res) => {
        const r = this.recipe();
        if (r) this.recipe.set({ ...r, isFavorite: res.isFavorite });
      },
      error: () => {
        const r = this.recipe();
        if (r) this.recipe.set({ ...r, isFavorite: previous });
      },
    });
  }

  edit(): void {
    this.router.navigate(['/recipes', this.id(), 'edit']);
  }

  askDelete(): void {
    this.confirmingDelete.set(true);
  }
  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }
  confirmDelete(): void {
    // DELETE /api/recipes/:id then return to the box.
    this.recipeService.remove(this.id()).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }
}
