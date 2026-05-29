import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ACTIVE_SESSIONS } from '@shared/mocks/settings.mock';

@Component({
  selector: 'app-security-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './security-panel.component.html',
  styleUrl: './security-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityPanelComponent {
  private readonly fb = inject(FormBuilder);

  readonly sessions = ACTIVE_SESSIONS;

  readonly passwordForm = this.fb.nonNullable.group({
    current: ['', [Validators.required]],
    next: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordForm.reset();
  }
}
