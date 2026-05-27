import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Project } from '@shared/models';
import { PROJECTS } from '@shared/mocks/projects.mock';
import {
  NewProjectDialogComponent,
  NewProjectResult,
} from '../new-project-dialog/new-project-dialog.component';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | Project['status'];

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  host:{
    class: 'block'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly dialog = inject(MatDialog);

  readonly view = signal<ViewMode>('grid');
  readonly status = signal<StatusFilter>('all');

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly search = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });

  private readonly projects = signal<readonly Project[]>(PROJECTS);

  readonly filteredProjects = computed<readonly Project[]>(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.status();

    return this.projects().filter(project => {
      const matchesStatus = status === 'all' || project.status === status;
      const matchesQuery =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  });

  readonly statusFilters: readonly { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'archived', label: 'Archived' },
  ];

  openNewProject(): void {
    this.dialog
      .open<NewProjectDialogComponent, void, NewProjectResult | undefined>(
        NewProjectDialogComponent,
        { autoFocus: 'first-tabbable', restoreFocus: true },
      )
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        // TODO: persist via API once available. For now seed the local list.
        const next: Project = {
          id: Math.max(0, ...this.projects().map(p => p.id)) + 1,
          name: result.name,
          description: result.description,
          status: 'planning',
          progress: 0,
          team: [],
          tasks: { total: 0, completed: 0 },
          dueDate: result.dueDate || '—',
          priority: result.priority,
        };
        this.projects.update(projects => [next, ...projects]);
      });
  }

  trackById(_index: number, project: Project): number {
    return project.id;
  }
}
