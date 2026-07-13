import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeInput } from '../../core/models';

/**
 * Reusable recipe editor form (title, ingredients, steps). Used by both the New
 * and Edit routes. Blocks submit while any required field is empty and surfaces
 * both client-side and server validation errors.
 */
@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css',
})
export class RecipeFormComponent {
  @Input() set value(v: RecipeInput | null) {
    if (v) {
      this.title = v.title;
      this.ingredients = v.ingredients;
      this.steps = v.steps;
    }
  }
  @Input() submitting = false;
  @Input() serverError: string | null = null;
  @Input() submitLabel = 'Save recipe';
  @Output() save = new EventEmitter<RecipeInput>();
  @Output() cancelForm = new EventEmitter<void>();

  title = '';
  ingredients = '';
  steps = '';
  readonly attempted = signal(false);

  get titleInvalid(): boolean {
    return this.attempted() && !this.title.trim();
  }
  get ingredientsInvalid(): boolean {
    return this.attempted() && !this.ingredients.trim();
  }
  get stepsInvalid(): boolean {
    return this.attempted() && !this.steps.trim();
  }

  submit(): void {
    this.attempted.set(true);
    if (!this.title.trim() || !this.ingredients.trim() || !this.steps.trim()) {
      return;
    }
    this.save.emit({
      title: this.title.trim(),
      ingredients: this.ingredients.trim(),
      steps: this.steps.trim(),
    });
  }

  cancel(): void {
    this.cancelForm.emit();
  }
}
