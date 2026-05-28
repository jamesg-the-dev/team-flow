import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { ProjectsApiService } from '@core/services/projects-api.service';
import { ThemeService } from '@core/services/theme.service';
import { withAlpha } from '@shared/utils/color';
import { ProjectDetails } from '@shared/models';
import { toApiPriority, toApiStatus, toProjectDetails } from '@shared/utils/project-mappers';

type TabKey = 'overview' | 'tasks' | 'team' | 'activity' | 'settings';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    BaseChartDirective,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly api = inject(ProjectsApiService);
  private readonly snackbar = inject(MatSnackBar);

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly project = signal<ProjectDetails | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeTab = signal<TabKey>('overview');

  readonly tabs: readonly { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'team', label: 'Team' },
    { key: 'activity', label: 'Activity' },
    { key: 'settings', label: 'Settings' },
  ];

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.load(id);
    });
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      project: this.api.get(id),
      members: this.api.listMembers(id).pipe(catchError(() => of([]))),
      stats: this.api.stats(id).pipe(catchError(() => of(undefined))),
      activity: this.api.activity(id, { pageSize: 25 }).pipe(
        map(page => page.items),
        catchError(() => of([])),
      ),
      velocity: this.api.velocity(id, { weeks: 12 }).pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ project, members, stats, activity, velocity }) => {
          this.project.set(toProjectDetails(project, members, stats, activity, velocity));
        },
        error: err => {
          console.error('Failed to load project', err);
          this.error.set('Unable to load this project.');
        },
      });
  }

  readonly statusVariant = computed(() => {
    const s = this.project()?.status;
    return s === 'active' || s === 'completed'
      ? 'success'
      : s === 'planning' || s === 'on-hold'
        ? 'warning'
        : 'neutral';
  });

  readonly priorityVariant = computed(() => {
    const p = this.project()?.priority;
    return p === 'critical' || p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'neutral';
  });

  // ---- Chart -------------------------------------------------------------

  readonly progressChartType: ChartConfiguration<'bar'>['type'] = 'bar';

  readonly progressChartData = computed<ChartData<'bar'>>(() => {
    const palette = this.theme.chartPalette();
    const history = this.project()?.progressHistory ?? [];
    return {
      labels: history.map(p => p.week),
      datasets: [
        {
          data: history.map(p => p.completed),
          backgroundColor: withAlpha(palette.primary, 0.85),
          hoverBackgroundColor: palette.primary,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 48,
        },
      ],
    };
  });

  readonly progressChartOptions = computed<ChartOptions<'bar'>>(() => {
    const palette = this.theme.chartPalette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: withAlpha(palette.onSurface, 0.85),
          titleColor: palette.surface,
          bodyColor: palette.surface,
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: palette.onSurfaceVariant } },
        y: {
          beginAtZero: true,
          grid: { color: withAlpha(palette.outlineVariant, 0.6) },
          ticks: { color: palette.onSurfaceVariant },
        },
      },
    };
  });

  openEditDialog() {}

  saveEdits(): void {
    const current = this.project();
    if (!current) return;
    this.api
      .update(current.id, {
        name: current.name,
        description: current.description || null,
        priority: toApiPriority(current.priority),
        startDate: current.startDate || null,
        dueDate: current.dueDate || null,
        colorHex: null,
      })
      .subscribe({
        next: () => this.snackbar.open('Project updated.', 'Dismiss', { duration: 3000 }),
        error: err => {
          console.error('Failed to update project', err);
          this.snackbar.open('Could not update project.', 'Dismiss', { duration: 4000 });
        },
      });
  }

  removeMember(userId: string): void {
    const id = this.routeId();
    if (!id) return;
    this.api.removeMember(id, userId).subscribe({
      next: () => {
        const current = this.project();
        if (current) {
          this.project.set({ ...current, team: current.team.filter(m => m.id !== userId) });
        }
      },
      error: err => {
        console.error('Failed to remove member', err);
        this.snackbar.open('Could not remove member.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  archiveProject(): void {
    const id = this.routeId();
    if (!id) return;
    this.api.updateStatus(id, { status: toApiStatus('archived') }).subscribe({
      next: () => {
        const current = this.project();
        if (current) this.project.set({ ...current, status: 'archived' });
        this.snackbar.open('Project archived.', 'Dismiss', { duration: 3000 });
      },
      error: err => {
        console.error('Failed to archive project', err);
        this.snackbar.open('Could not archive project.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  deleteProject(): void {
    const id = this.routeId();
    const name = this.project()?.name ?? 'this project';
    if (!id || !confirm(`Delete ${name}? This cannot be undone.`)) return;
    this.api.remove(id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: err => {
        console.error('Failed to delete project', err);
        this.snackbar.open('Could not delete project.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  updateField<K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]): void {
    const current = this.project();
    if (!current) return;
    this.project.set({ ...current, [key]: value });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  trackTeam(_index: number, member: { id: string }): string {
    return member.id;
  }

  trackActivity(_index: number, item: { id: string }): string {
    return item.id;
  }
}
