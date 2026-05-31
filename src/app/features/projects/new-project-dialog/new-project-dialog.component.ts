import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PriorityLevel } from '@shared/models/project-api';

export interface NewProjectResult {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly dueDate: string;
  readonly priority: PriorityLevel;
}

@Component({
  selector: 'app-new-project-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './new-project-dialog.component.html',
  styleUrl: './new-project-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<NewProjectDialogComponent, NewProjectResult | undefined>>(MatDialogRef);

  // Reserved for future "edit mode": consumers can pass a Project to seed the form.
  protected readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    key: [
      '',
      [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Z][A-Z0-9_-]{1,9}$/)],
    ],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    dueDate: [''],
    priority: [PriorityLevel.Medium, Validators.required],
  });

  readonly priorities: readonly PriorityLevel[] = [
    PriorityLevel.Low,
    PriorityLevel.Medium,
    PriorityLevel.High,
    PriorityLevel.Critical,
  ];

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
