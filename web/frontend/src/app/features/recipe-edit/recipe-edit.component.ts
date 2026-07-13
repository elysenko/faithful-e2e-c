import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { Recipe, RecipeInput } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';

/**
 * Edit an existing recipe. Loads the current values (GET /api/recipes/:id),
 * pre-fills the shared form, and on save (PATCH /api/recipes/:id) returns to the
 * detail view. The form blocks save while any required field is empty; server
 * validation errors (400) are surfaced inline.
 */
@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeFormComponent],
  templateUrl: './recipe-edit.component.html',
  styleUrl: './recipe-edit.component.css',
})
export class RecipeEditComponent implements OnInit {
  readonly id = signal<string>('');
  readonly recipe = signal<Recipe | undefined>(undefined);
  readonly loaded = signal(false);
  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly formValue = computed<RecipeInput | null>(() => {
    const r = this.recipe();
    return r ? { title: r.title, ingredients: r.ingredients, steps: r.steps } : null;
  });

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

  onSave(input: RecipeInput): void {
    // PATCH /api/recipes/:id then return to the detail view.
    this.submitting.set(true);
    this.serverError.set(null);
    this.recipeService.update(this.id(), input).subscribe({
      next: () => this.router.navigate(['/recipes', this.id()]),
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(extractError(err) ?? 'Could not save your changes. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/recipes', this.id()]);
  }
}

function extractError(err: unknown): string | null {
  const message = (err as { error?: { message?: string | string[] } })?.error?.message;
  if (Array.isArray(message)) return message[0] ?? null;
  return typeof message === 'string' ? message : null;
}
