import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TASK_ACTIVITY, TASK_COMMENTS } from '@shared/mocks/kanban.mock';
import { Task } from '@shared/models';

@Component({
  selector: 'app-task-details-drawer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './task-details-drawer.component.html',
  styleUrl: './task-details-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition(':enter', animate('260ms cubic-bezier(0.32, 0.72, 0, 1)')),
      transition(
        ':leave',
        animate('220ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(100%)' })),
      ),
    ]),
    trigger('fadeOverlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class TaskDetailsDrawerComponent {
  @Input() task: Task | null = null;
  @Output() readonly closed = new EventEmitter<void>();

  readonly comments = TASK_COMMENTS;
  readonly activity = TASK_ACTIVITY;
  readonly commentControl = new FormControl('', { nonNullable: true });
  readonly activeTab = signal<'comments' | 'activity'>('comments');

  close(): void {
    this.closed.emit();
  }

  postComment(): void {
    const value = this.commentControl.value.trim();
    if (!value) return;
    // Persist via API in production; for the showcase we just clear.
    this.commentControl.setValue('');
  }
}
