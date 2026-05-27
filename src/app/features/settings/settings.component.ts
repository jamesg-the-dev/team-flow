import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeMode, ThemeService } from '@core/services/theme.service';
import {
  ACTIVE_SESSIONS,
  EMAIL_NOTIFICATIONS,
  PUSH_NOTIFICATIONS,
  TEAM_MEMBERS,
} from '@shared/mocks/settings.mock';

interface SettingsSection {
  readonly id: 'profile' | 'notifications' | 'security' | 'appearance' | 'team' | 'billing';
  readonly name: string;
  readonly icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);

  readonly sections: readonly SettingsSection[] = [
    { id: 'profile', name: 'Profile', icon: 'person' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'security', name: 'Security', icon: 'shield' },
    { id: 'appearance', name: 'Appearance', icon: 'palette' },
    { id: 'team', name: 'Team', icon: 'group' },
    { id: 'billing', name: 'Billing', icon: 'credit_card' },
  ];

  readonly activeSection = signal<SettingsSection['id']>('profile');
  readonly themeMode = this.themeService.mode;

  readonly themeOptions: readonly ThemeMode[] = ['light', 'dark', 'system'];

  readonly emailPrefs = EMAIL_NOTIFICATIONS;
  readonly pushPrefs = PUSH_NOTIFICATIONS;
  readonly sessions = ACTIVE_SESSIONS;
  readonly team = TEAM_MEMBERS;

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['John', [Validators.required]],
    lastName: ['Doe', [Validators.required]],
    email: ['john@acme.com', [Validators.required, Validators.email]],
    jobTitle: ['Product Designer'],
    bio: ['Product designer passionate about creating delightful user experiences.'],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    current: ['', [Validators.required]],
    next: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  selectSection(id: SettingsSection['id']): void {
    this.activeSection.set(id);
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    // Persist via API in production.
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordForm.reset();
  }
}
