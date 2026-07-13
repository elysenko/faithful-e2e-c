import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * FaithfulC signup. The first account created server-side becomes an admin,
 * later ones are regular users. On success AuthService redirects to the box.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  email = '';
  password = '';
  confirm = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private auth: AuthService) {}

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Enter your email and a password.');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password !== this.confirm) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.signup(this.email, this.password).subscribe({
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'That email is already registered.');
      },
    });
  }
}
