import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { RecipeInput } from '../../core/models';

/**
 * Create a new recipe. On save (→ POST /api/recipes) navigates back to the box
 * where the new card appears. Validation errors are shown inline by the form.
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

  constructor(private router: Router) {}

  onSave(_input: RecipeInput): void {
    // Mockup: no backend call — simulate a successful create and return home.
    this.submitting.set(true);
    this.serverError.set(null);
    this.router.navigate(['/']);
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
