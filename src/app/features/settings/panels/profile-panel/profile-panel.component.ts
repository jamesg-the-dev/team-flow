import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

const AVATAR_OPTIONS: readonly { name: string; path: string }[] = [
  { name: 'Azure Bandit', path: '/images/avatars/avatar-1.png' },
  { name: 'Emerald Goblin', path: '/images/avatars/avatar-2.png' },
  { name: 'Violet Phantom', path: '/images/avatars/avatar-3.png' },
  { name: 'Tangerine Marauder', path: '/images/avatars/avatar-4.png' },
];

const AUSTRALIAN_TIMEZONES: readonly { value: string; label: string }[] = [
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Australia/Hobart', label: 'Hobart (AEST/AEDT)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Darwin', label: 'Darwin (ACST)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Eucla', label: 'Eucla (ACWST)' },
  { value: 'Australia/Lord_Howe', label: 'Lord Howe Island (LHST/LHDT)' },
  { value: 'Pacific/Norfolk', label: 'Norfolk Island (NFT)' },
  { value: 'Indian/Christmas', label: 'Christmas Island (CXT)' },
  { value: 'Indian/Cocos', label: 'Cocos Islands (CCT)' },
];

import { MeApiService, UserProfile } from '@core/services/me-api.service';
import { getInitials } from '@shared/utils/initials';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './profile-panel.component.html',
  styleUrl: './profile-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly meApi = inject(MeApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    displayName: ['', [Validators.maxLength(100)]],
    avatarPath: ['', [Validators.maxLength(500)]],
    bio: ['', [Validators.maxLength(1000)]],
    timezone: ['', [Validators.maxLength(100)]],
    locale: ['', [Validators.maxLength(20)]],
  });

  readonly loading = signal(false);
  readonly saving = signal(false);
  protected readonly profile = signal<UserProfile | null>(null);
  readonly currentAvatar = signal<string | null>(null);
  readonly avatarOptions = AVATAR_OPTIONS;
  readonly timezoneOptions = AUSTRALIAN_TIMEZONES;

  readonly avatarInitials = computed(() =>
    getInitials(this.profile()?.displayName || this.profile()?.fullName),
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.meApi
      .getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: profile => {
          this.profile.set(profile);
          this.currentAvatar.set(profile.avatarPath ?? null);
          this.profileForm.reset({
            fullName: profile.fullName ?? '',
            displayName: profile.displayName ?? '',
            avatarPath: profile.avatarPath ?? '',
            bio: profile.bio ?? '',
            timezone: profile.timezone ?? '',
            locale: profile.locale ?? '',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.snackbar.open(err?.error?.detail ?? 'Could not load profile.', 'Dismiss', {
            duration: 4000,
          });
        },
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const payload = {
      fullName: raw.fullName.trim(),
      displayName: this.nullIfBlank(raw.displayName),
      avatarPath: this.nullIfBlank(raw.avatarPath),
      bio: this.nullIfBlank(raw.bio),
      timezone: this.nullIfBlank(raw.timezone),
      locale: this.nullIfBlank(raw.locale),
    };

    this.saving.set(true);
    this.meApi
      .updateProfile(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: profile => {
          this.profile.set(profile);
          this.currentAvatar.set(profile.avatarPath ?? null);
          this.profileForm.markAsPristine();
          this.snackbar.open('Profile updated.', 'Dismiss', { duration: 3000 });
        },
        error: (err: HttpErrorResponse) => {
          this.snackbar.open(err?.error?.detail ?? 'Could not update profile.', 'Dismiss', {
            duration: 4000,
          });
        },
      });
  }

  private nullIfBlank(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  selectAvatar(path: string): void {
    if (this.currentAvatar() === path) {
      return;
    }
    this.currentAvatar.set(path);
    this.profileForm.controls.avatarPath.setValue(path);
    this.profileForm.controls.avatarPath.markAsDirty();
  }

  removeAvatar(): void {
    if (this.currentAvatar() === null) {
      return;
    }
    this.currentAvatar.set(null);
    this.profileForm.controls.avatarPath.setValue('');
    this.profileForm.controls.avatarPath.markAsDirty();
  }
}
