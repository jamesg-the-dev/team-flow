import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  WorkspaceMemberDto,
  WorkspaceMembersApiService,
} from '@core/services/workspace-members-api.service';
import { getInitials } from '@shared/utils/initials';
import { ProjectMemberRole } from '@shared/models/project-api';

export interface AddMemberDialogData {
  readonly projectName?: string;
  readonly existingMemberIds?: readonly string[];
}

export interface AddMemberResult {
  readonly userId: string;
  readonly role: ProjectMemberRole;
}

interface RoleOption {
  readonly value: ProjectMemberRole;
  readonly label: string;
  readonly description: string;
}

interface MemberOption {
  readonly userId: string;
  readonly name: string;
  readonly initials: string;
  readonly subtitle: string | null;
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMemberDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<AddMemberDialogComponent, AddMemberResult | undefined>>(MatDialogRef);
  private readonly membersApi = inject(WorkspaceMembersApiService);

  protected readonly data = inject<AddMemberDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    role: ['Contributor' as ProjectMemberRole, Validators.required],
  });

  readonly roles: readonly RoleOption[] = [
    { value: 'Lead', label: 'Lead', description: 'Full access, can manage members and settings.' },
    {
      value: 'Contributor',
      label: 'Contributor',
      description: 'Can create and edit tasks on this project.',
    },
    { value: 'Viewer', label: 'Viewer', description: 'Read-only access to the project.' },
  ];

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  private readonly workspaceMembers = signal<readonly WorkspaceMemberDto[]>([]);

  readonly memberOptions = computed<readonly MemberOption[]>(() => {
    const existing = new Set(this.data?.existingMemberIds ?? []);
    return this.workspaceMembers()
      .filter(m => !existing.has(m.userId))
      .map(m => {
        const name = m.fullName?.trim() || 'Unnamed member';
        const subtitleParts = [m.title?.trim(), m.role].filter(
          (s): s is string => !!s && s.length > 0,
        );
        return {
          userId: m.userId,
          name,
          initials: getInitials(name),
          subtitle: subtitleParts.length ? subtitleParts.join(' • ') : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  private readonly userIdValue = toSignal(this.form.controls.userId.valueChanges, {
    initialValue: this.form.controls.userId.value,
  });
  private readonly roleValue = toSignal(this.form.controls.role.valueChanges, {
    initialValue: this.form.controls.role.value,
  });

  readonly selectedMember = computed(() =>
    this.memberOptions().find(m => m.userId === this.userIdValue()) ?? null,
  );
  readonly selectedRole = computed(() =>
    this.roles.find(r => r.value === this.roleValue()) ?? null,
  );

  constructor() {
    this.membersApi.getMembers().subscribe({
      next: members => {
        this.workspaceMembers.set(members);
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load workspace members', err);
        this.loadError.set('Could not load workspace members.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
