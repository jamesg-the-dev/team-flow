import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Priority } from '@shared/models';

export interface NewProjectResult {
  readonly name: string;
  readonly description: string;
  readonly dueDate: string;
  readonly priority: Priority;
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
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    dueDate: [''],
    priority: ['medium' as Priority, Validators.required],
  });

  readonly priorities: readonly Priority[] = ['low', 'medium', 'high'];

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
