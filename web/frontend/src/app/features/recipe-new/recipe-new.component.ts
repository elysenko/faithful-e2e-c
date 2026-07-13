import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { RecipeInput } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';

/**
 * Create a new recipe. On save (POST /api/recipes) navigates back to the box
 * where the new card appears. Client-side required-field validation is handled
 * by the shared form; server validation errors (400) are surfaced inline.
 */
@Component({
  selector: 'app-recipe-new',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeFormComponent],
  templateUrl: './recipe-new.component.html',
  styleUrl: './recipe-new.component.css',
})
export class RecipeNewComponent {
  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  constructor(private router: Router, private recipeService: RecipeService) {}

  onSave(input: RecipeInput): void {
    this.submitting.set(true);
    this.serverError.set(null);
    this.recipeService.create(input).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(extractError(err) ?? 'Could not add your recipe. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}

function extractError(err: unknown): string | null {
  const message = (err as { error?: { message?: string | string[] } })?.error?.message;
  if (Array.isArray(message)) return message[0] ?? null;
  return typeof message === 'string' ? message : null;
}
