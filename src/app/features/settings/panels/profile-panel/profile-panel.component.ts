import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './profile-panel.component.html',
  styleUrl: './profile-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePanelComponent {
  private readonly fb = inject(FormBuilder);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['John', [Validators.required]],
    lastName: ['Doe', [Validators.required]],
    email: ['john@acme.com', [Validators.required, Validators.email]],
    jobTitle: ['Product Designer'],
    bio: ['Product designer passionate about creating delightful user experiences.'],
  });

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    // Persist via API in production.
  }
}
