import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recipe, RecipeInput } from '../../core/models';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css',
})
export class RecipeFormComponent implements OnInit {
  @Input() recipe: Recipe | null = null;
  @Input() submitLabel = 'Save recipe';
  /** Form-level message from the server (e.g. a 400 validation summary). */
  @Input() serverError: string | null = null;
  /** Per-field server messages keyed by control name (title/ingredients/steps). */
  @Input() fieldErrors: Record<string, string> | null = null;
  @Output() save = new EventEmitter<RecipeInput>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  /** Server-provided error for a specific field, if any. */
  serverFieldError(control: string): string | null {
    return this.fieldErrors?.[control] ?? null;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.recipe?.title ?? '', [Validators.required, Validators.maxLength(120)]],
      ingredients: [this.recipe?.ingredients ?? '', [Validators.required]],
      steps: [this.recipe?.steps ?? '', [Validators.required]],
    });
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value as RecipeInput);
  }
}
