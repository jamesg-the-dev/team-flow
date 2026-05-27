import { CdkDrag, CdkDragDrop, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { INITIAL_TASKS, KANBAN_COLUMNS } from '@shared/mocks/kanban.mock';
import { Task, TaskColumn } from '@shared/models';

import { TaskCardComponent } from './task-card/task-card.component';
import { TaskDetailsDrawerComponent } from './task-details-drawer/task-details-drawer.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    TaskCardComponent,
    TaskDetailsDrawerComponent,
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent {
  readonly columns = KANBAN_COLUMNS;
  readonly columnDropListIds = this.columns.map(column => `drop-${column.id}`);

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly search = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });

  private readonly tasks = signal<Task[]>([...INITIAL_TASKS]);
  readonly selectedTask = signal<Task | null>(null);

  readonly tasksByColumn = computed(() => {
    const query = this.search().toLowerCase().trim();
    const all = this.tasks();
    const filtered = query
      ? all.filter(
          task =>
            task.title.toLowerCase().includes(query) ||
            task.labels.some(l => l.toLowerCase().includes(query)),
        )
      : all;
    const grouped = new Map<TaskColumn, Task[]>();
    for (const column of this.columns) grouped.set(column.id, []);
    for (const task of filtered) grouped.get(task.column)?.push(task);
    return grouped;
  });

  tasksFor(column: TaskColumn): Task[] {
    return this.tasksByColumn().get(column) ?? [];
  }

  dropListIdFor(column: TaskColumn): string {
    return `drop-${column}`;
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: TaskColumn): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const moved = event.item.data as Task;
    this.tasks.update(current =>
      current.map(task => (task.id === moved.id ? { ...task, column: targetColumn } : task)),
    );

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  closeTask(): void {
    this.selectedTask.set(null);
  }
}
