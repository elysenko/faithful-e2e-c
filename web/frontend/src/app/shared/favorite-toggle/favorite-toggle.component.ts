import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorite-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-toggle.component.html',
  styleUrl: './favorite-toggle.component.css',
})
export class FavoriteToggleComponent {
  @Input() favorite = false;
  @Input() size: 'sm' | 'lg' = 'sm';
  @Output() toggle = new EventEmitter<void>();

  onClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.toggle.emit();
  }
}
