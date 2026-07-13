import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    username: ['demo', [Validators.required]],
    password: ['demo1234', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: { status?: number }) => {
        this.errorMessage =
          err?.status === 401
            ? 'Invalid credentials'
            : err?.status === 503
              ? 'Service temporarily unavailable. Please try again.'
              : 'Unable to sign in. Please try again.';
        this.loading = false;
      },
    });
  }

  demoMode(): void {
    this.auth.demoLogin();
  }
}
