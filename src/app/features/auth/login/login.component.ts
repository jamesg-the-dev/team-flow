import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@core/services/auth.service';
import { DEFAULT_USER } from '@shared/mocks/user.mock';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly currentYear = new Date().getFullYear();
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: [DEFAULT_USER.email, [Validators.required, Validators.email]],
    password: [DEFAULT_USER.password, [Validators.required, Validators.minLength(8)]],
    remember: [true],
  });

  readonly highlights: readonly { title: string; description: string }[] = [
    {
      title: 'Streamlined workflows',
      description: 'Keep your team aligned with powerful project management tools.',
    },
    {
      title: 'Real-time collaboration',
      description: 'Work together seamlessly with instant updates and notifications.',
    },
    {
      title: 'Insights & analytics',
      description: 'Make data-driven decisions with comprehensive reporting.',
    },
  ];

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.signInWithPassword(email, password);
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
      await this.router.navigateByUrl(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
