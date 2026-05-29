import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProjectMemberRole } from '@shared/models/project-api';

export interface AddMemberDialogData {
  readonly projectName?: string;
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

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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

  protected readonly data = inject<AddMemberDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    userId: ['', [Validators.required, Validators.pattern(UUID_PATTERN)]],
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
