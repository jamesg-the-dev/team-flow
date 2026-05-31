import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PriorityLevel, TaskColumn } from '../../../shared/models/project-api';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const priorityLevels: (keyof typeof PriorityLevel)[] = ['Low', 'Medium', 'High', 'Critical'];

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-task-dialog.component.html',
  styleUrls: ['./add-task-dialog.component.scss'],
})
export class AddTaskDialogComponent {
  form: FormGroup;
  priorities = priorityLevels;
  columns = Object.keys(TaskColumn).filter(k => isNaN(Number(k)));

  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<AddTaskDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { projectId: string; column?: TaskColumn };

  constructor() {
    this.form = this.fb.group({
      title: [null, Validators.required],
      description: [null],
      priority: [PriorityLevel.Medium, Validators.required],
      assigneeId: [null],
      estimateHours: [null],
      dueDate: [null],
      column: [this.data.column ?? TaskColumn.Backlog, Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
