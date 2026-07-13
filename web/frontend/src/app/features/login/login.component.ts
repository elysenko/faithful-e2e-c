import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * FaithfulC login. Talks to the live backend via AuthService; on success the
 * service redirects to the recipe box. Includes a Demo Mode bypass so reviewers
 * can inspect the authenticated UI without a backend.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private auth: AuthService) {}

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Enter your email and password.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Invalid email or password.');
      },
    });
  }

  demo(): void {
    this.auth.demoLogin('admin');
  }
}
