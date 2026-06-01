import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';

import { ProjectsApiService } from '@core/services/projects-api.service';
import { Project } from '@shared/models';
import { ProjectDto, ProjectSummaryDto } from '@shared/models/project-api';
import {
  projectDtoToListItem,
  summaryToProjectListItem,
  toApiPriority,
  toApiStatus,
} from '@shared/utils/project-mappers';
import {
  NewProjectDialogComponent,
  NewProjectResult,
} from '@features/projects/new-project-dialog/new-project-dialog.component';

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
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  dialog = inject(MatDialog);
  api = inject(ProjectsApiService);
  snackbar = inject(MatSnackBar);
  route = inject(ActivatedRoute);
  router = inject(Router);

  view = signal<ViewMode>('grid');
  status = signal<StatusFilter>('all');

  searchControl = new FormControl('', { nonNullable: true });
  search = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });

  projects = signal<readonly Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  filteredProjects = computed<readonly Project[]>(() => {
    const query = this.search().trim().toLowerCase();
    return this.projects().filter(project => {
      const matchesQuery =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      return matchesQuery;
    });
  });

  statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'on-hold', label: 'On hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const statusParam = params.get('status') as StatusFilter | null;
      const validStatus = this.statusFilters.some(f => f.value === statusParam);
      const status = statusParam && validStatus ? statusParam : 'all';
      if (this.status() !== status) {
        this.status.set(status);
      }
      this.refresh();
    });
  }

  async onStatusFilterChange(status: StatusFilter) {
    this.status.set(status);
    const queryParams = { ...this.route.snapshot.queryParams };

    if (status === 'all') {
      queryParams['status'] = null;
    } else {
      queryParams['status'] = status;
    }

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.status();
    const query: any = { pageSize: 100, activeOnly: true };
    if (status && status !== 'all') {
      query.status = toApiStatus(status);
    }
    this.api
      .list(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: page =>
          this.projects.set(page.items.map((s: ProjectSummaryDto) => summaryToProjectListItem(s))),
        error: err => {
          console.error('Failed to load projects', err);
          this.error.set('Unable to load projects. Please try again.');
        },
      });
  }

  openNewProject(): void {
    this.dialog
      .open<NewProjectDialogComponent, void, NewProjectResult | undefined>(
        NewProjectDialogComponent,
        { autoFocus: 'first-tabbable', restoreFocus: true },
      )
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.api
          .create({
            key: result.key,
            name: result.name,
            description: result.description || null,
            priority: toApiPriority(result.priority),
            startDate: null,
            dueDate: result.dueDate || null,
            colorHex: null,
          })
          .subscribe({
            next: created => this.prependProject(created),
            error: err => {
              console.error('Failed to create project', err);
              this.snackbar.open(err?.error?.detail ?? 'Could not create project.', 'Dismiss', {
                duration: 4000,
              });
            },
          });
      });
  }

  archive(project: Project, event?: Event): void {
    event?.stopPropagation();
    this.api.updateStatus(project.id, { status: 'Archived' }).subscribe({
      next: () =>
        this.projects.update(list =>
          list.map(p => (p.id === project.id ? { ...p, status: 'archived' } : p)),
        ),
      error: err => {
        console.error('Failed to archive project', err);
        this.snackbar.open('Could not archive project.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  remove(project: Project, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    this.api.remove(project.id).subscribe({
      next: () => this.projects.update(list => list.filter(p => p.id !== project.id)),
      error: err => {
        console.error('Failed to delete project', err);
        this.snackbar.open('Could not delete project.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  trackById(_index: number, project: Project): string {
    return project.id;
  }

  private prependProject(dto: ProjectDto): void {
    this.projects.update(list => [projectDtoToListItem(dto), ...list]);
  }
}
