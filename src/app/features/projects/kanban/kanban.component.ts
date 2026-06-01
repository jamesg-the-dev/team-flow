import { CdkDrag, CdkDragDrop, CdkDropList, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { KANBAN_COLUMNS } from '@shared/mocks/kanban.mock';
import {
  TaskColumn,
  TaskBoardCardDto,
  GetProjectBoardResponse,
  CreateTaskRequest,
} from '@shared/models/project-api';
import { Task } from '@shared/models';
import { TasksApiService } from '@core/services/tasks-api.service';

import { TaskCardComponent } from './task-card/task-card.component';
import { TaskDetailsDrawerComponent } from './task-details-drawer/task-details-drawer.component';
import { AddTaskDialogComponent } from './add-task-dialog.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
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
  readonly columnDropListIds = this.columns.map((column: any) => `drop-${column.id}`);

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly search = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });

  private readonly api = inject(TasksApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly selectedTask = signal<Task | null>(null);
  readonly board = signal<GetProjectBoardResponse | null>(null);
  readonly loading = signal(false);
  readonly projectId = toSignal(
    this.route.paramMap.pipe(map((params: any) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  constructor() {
    this.loadBoard();
  }

  loadBoard() {
    const projectId = this.projectId();
    if (!projectId) return;
    this.loading.set(true);
    this.api.getProjectBoard(projectId).subscribe({
      next: board => {
        this.board.set(board);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Map TaskBoardCardDto to Task for UI compatibility
  private mapToTask(dto: TaskBoardCardDto): Task {
    return {
      id: dto.id,
      title: dto.title,
      description: '',
      assignee: dto.assigneeId ?? '',
      priority: (dto.priority?.toLowerCase?.() ?? 'medium') as any,
      labels: [],
      comments: 0,
      attachments: 0,
      dueDate: dto.dueDate,
      column: dto.column,
    };
  }

  tasksFor(column: TaskColumn): Task[] {
    return (this.board()?.[column] ?? []).map(dto => this.mapToTask(dto));
  }

  dropListIdFor(column: TaskColumn): string {
    return `drop-${column}`;
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: TaskColumn): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const moved = event.item.data as Task;
    const currentBoard = this.board();
    if (currentBoard) {
      const prevColumn = moved.column;
      const updatedBoard: GetProjectBoardResponse = { ...currentBoard };
      updatedBoard[prevColumn] = (updatedBoard[prevColumn] || []).filter(
        (dto: TaskBoardCardDto) => dto.id !== moved.id,
      );
      const movedDto = (currentBoard[prevColumn] || []).find(
        (dto: TaskBoardCardDto) => dto.id === moved.id,
      );
      if (movedDto) {
        const updatedMovedDto = { ...movedDto, column: targetColumn };
        updatedBoard[targetColumn] = [updatedMovedDto, ...(updatedBoard[targetColumn] || [])];
        this.board.set(updatedBoard);
      }
    }
    this.api.moveTask(moved.id, { targetColumn }).subscribe({
      next: () => this.loadBoard(),
      error: () => this.loadBoard(),
    });
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  deleteTask(task: Task): void {
    this.api.deleteTask(task.id ?? '').subscribe({
      next: () => this.loadBoard(),
      error: () => this.loadBoard(),
    });
  }

  closeTask(): void {
    this.selectedTask.set(null);
  }

  openAddTaskDialog(): void {
    this.openAddTaskDialogForColumn();
  }

  openAddTaskDialogForColumn(column?: TaskColumn): void {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      data: { projectId: this.projectId(), column },
    });
    dialogRef.afterClosed().subscribe((result: CreateTaskRequest | undefined) => {
      if (result) {
        this.api.createTask(this.projectId(), result).subscribe({
          next: () => this.loadBoard(),
        });
      }
    });
  }
}
