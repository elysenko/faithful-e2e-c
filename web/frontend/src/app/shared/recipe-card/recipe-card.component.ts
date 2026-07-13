import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../core/models';
import { FavoriteToggleComponent } from '../favorite-toggle/favorite-toggle.component';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FavoriteToggleComponent],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Output() favorite = new EventEmitter<void>();

  get ingredientCount(): number {
    return this.recipe.ingredients.split('\n').filter((l) => l.trim().length > 0).length;
  }

  get stepCount(): number {
    return this.recipe.steps.split('\n').filter((l) => l.trim().length > 0).length;
  }

  get preview(): string {
    return this.recipe.ingredients
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .slice(0, 3)
      .join(' · ');
  }
}
