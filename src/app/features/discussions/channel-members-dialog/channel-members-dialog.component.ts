import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { DiscussionsApiService } from '@core/services/discussions-api.service';
import { WorkspaceMemberDto } from '@core/services/workspace-members-api.service';
import { ChannelMemberDto } from '@shared/models/discussions-api';
import { getInitials } from '@shared/utils/initials';

export interface ChannelMembersDialogData {
  readonly channelId: string;
  readonly channelName: string;
  readonly canManage: boolean;
  readonly currentUserId: string | null;
  readonly workspaceMembers: readonly WorkspaceMemberDto[];
}

interface MemberRow {
  readonly userId: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string | null;
}

@Component({
  selector: 'app-channel-members-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Members of #{{ data.channelName }}</h2>
    <mat-dialog-content class="dialog__content">
      @if (data.canManage) {
        <div class="dialog__add">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
            <mat-label>Add member</mat-label>
            <mat-select [formControl]="addControl">
              @for (m of addableMembers(); track m.userId) {
                <mat-option [value]="m.userId">
                  <span class="dialog__option">
                    <span class="avatar avatar--sm">{{ initialsFor(m) }}</span>
                    <span>{{ m.fullName ?? m.userId }}</span>
                  </span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button
            mat-flat-button
            color="primary"
            type="button"
            [disabled]="!addControl.value || busy()"
            (click)="add()"
          >
            <mat-icon>person_add</mat-icon> Add
          </button>
        </div>
      }

      @if (loading()) {
        <div class="dialog__loading"><mat-spinner diameter="28" /></div>
      } @else {
        <ul class="dialog__list">
          @for (row of rows(); track row.userId) {
            <li class="dialog__row">
              <span class="avatar avatar--md">{{ row.initials }}</span>
              <div class="dialog__meta">
                <span class="dialog__name">{{ row.name }}</span>
                @if (row.role) {
                  <span class="dialog__role">{{ row.role }}</span>
                }
              </div>
              @if (data.canManage && row.userId !== data.currentUserId) {
                <button
                  mat-icon-button
                  type="button"
                  aria-label="Remove member"
                  [disabled]="busy()"
                  (click)="remove(row.userId)"
                >
                  <mat-icon>person_remove</mat-icon>
                </button>
              }
            </li>
          } @empty {
            <li class="dialog__empty">No members yet.</li>
          }
        </ul>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host { display: block; min-width: 26rem; }
      .dialog__content { display: flex; flex-direction: column; gap: 0.75rem; }
      .dialog__add { display: flex; gap: 0.5rem; align-items: center; }
      .dialog__loading { display: flex; justify-content: center; padding: 1rem 0; }
      .dialog__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; max-height: 22rem; overflow-y: auto; }
      .dialog__row {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.375rem 0.5rem;
        border-radius: 0.5rem;
      }
      .dialog__row:hover { background: color-mix(in srgb, var(--sys-secondary-container) 40%, transparent); }
      .dialog__meta { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .dialog__name { font-weight: 600; font-size: 0.875rem; }
      .dialog__role { font-size: 0.75rem; color: var(--sys-on-surface-variant); }
      .dialog__option { display: inline-flex; align-items: center; gap: 0.5rem; }
      .dialog__empty { padding: 1rem; text-align: center; color: var(--sys-on-surface-variant); }
    `,
  ],
})
export class ChannelMembersDialogComponent {
  private readonly api = inject(DiscussionsApiService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly dialogRef = inject<MatDialogRef<ChannelMembersDialogComponent>>(MatDialogRef);
  protected readonly data = inject<ChannelMembersDialogData>(MAT_DIALOG_DATA);

  readonly addControl = new FormControl('', { nonNullable: true });
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly members = signal<readonly ChannelMemberDto[]>([]);

  private readonly memberLookup = new Map(this.data.workspaceMembers.map(m => [m.userId, m]));

  readonly rows = computed<readonly MemberRow[]>(() =>
    this.members().map(m => {
      const ws = this.memberLookup.get(m.userId);
      return {
        userId: m.userId,
        name: ws?.fullName ?? m.userId,
        initials: getInitials(ws?.fullName ?? m.userId),
        role: ws?.title ?? ws?.role ?? null,
      };
    }),
  );

  readonly addableMembers = computed(() => {
    const existing = new Set(this.members().map(m => m.userId));
    return this.data.workspaceMembers.filter(m => !existing.has(m.userId));
  });

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    this.api
      .listChannelMembers(this.data.channelId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: list => this.members.set(list),
        error: () => this.snackbar.open('Failed to load members.', 'Dismiss', { duration: 3000 }),
      });
  }

  initialsFor(m: WorkspaceMemberDto): string {
    return getInitials(m.fullName ?? m.userId);
  }

  add(): void {
    const userId = this.addControl.value;
    if (!userId) return;
    this.busy.set(true);
    this.api
      .addChannelMember(this.data.channelId, { userId })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.addControl.reset('');
          this.refresh();
        },
        error: () => this.snackbar.open('Failed to add member.', 'Dismiss', { duration: 3000 }),
      });
  }

  remove(userId: string): void {
    this.busy.set(true);
    this.api
      .removeChannelMember(this.data.channelId, userId)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.refresh(),
        error: () => this.snackbar.open('Failed to remove member.', 'Dismiss', { duration: 3000 }),
      });
  }
}
