import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { ThemeService } from '@core/services/theme.service';
import { DashboardService, type DashboardResponse } from '@core/services/dashboard.service';
import { ProjectsApiService } from '@core/services/projects-api.service';
import type { ProjectSummaryDto } from '@shared/models/project-api';
import { EMPTY, catchError } from 'rxjs';
import { withAlpha } from '@shared/utils/color';
import {
  ACTIVITY_DATA,
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  RecentActivity,
  VELOCITY_DATA,
  type ActiveProject,
} from '@shared/mocks/dashboard.mock';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    BaseChartDirective,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: {
    class: 'flex-auto',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly theme = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly dashboardApi = inject(DashboardService);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stats = signal(DASHBOARD_STATS);
  readonly recentActivity = signal<readonly RecentActivity[]>([]);
  readonly activeProjects = signal<readonly ActiveProject[]>([]);
  readonly workspaceSummary = signal<DashboardResponse | null>(null);

  readonly tasksChartType: ChartConfiguration<'bar'>['type'] = 'bar';

  readonly userProfile = this.authService.profile;

  readonly tasksChartData = computed<ChartData<'bar'>>(() => {
    const palette = this.theme.chartPalette();
    return {
      labels: ACTIVITY_DATA.map(d => d.name),
      datasets: [
        {
          data: ACTIVITY_DATA.map(d => d.tasks),
          backgroundColor: withAlpha(palette.primary, 0.85),
          hoverBackgroundColor: palette.primary,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 40,
        },
      ],
    };
  });

  readonly tasksChartOptions = computed<ChartOptions<'bar'>>(() => {
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
        x: {
          grid: { display: false },
          ticks: { color: palette.onSurfaceVariant },
        },
        y: {
          beginAtZero: true,
          grid: { color: withAlpha(palette.outlineVariant, 0.6) },
          ticks: { color: palette.onSurfaceVariant },
        },
      },
    };
  });

  readonly velocityChartType: ChartConfiguration<'line'>['type'] = 'line';

  readonly velocityChartData = computed<ChartData<'line'>>(() => {
    const palette = this.theme.chartPalette();
    return {
      labels: VELOCITY_DATA.map(d => d.week),
      datasets: [
        {
          data: VELOCITY_DATA.map(d => d.velocity),
          borderColor: palette.primary,
          backgroundColor: withAlpha(palette.primary, 0.12),
          pointBackgroundColor: palette.primary,
          pointBorderColor: palette.onPrimary,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  });

  readonly velocityChartOptions = computed<ChartOptions<'line'>>(() => {
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
        x: {
          grid: { display: false },
          ticks: { color: palette.onSurfaceVariant },
        },
        y: {
          beginAtZero: true,
          grid: { color: withAlpha(palette.outlineVariant, 0.6) },
          ticks: { color: palette.onSurfaceVariant },
        },
      },
    };
  });

  constructor() {
    this.loadRemote();
  }

  private getActiveProjects(): void {
    this.projectsApi
      .list({ activeOnly: true, pageSize: 4 })
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(page => {
        this.activeProjects.set(page.items.map(p => this.toActiveProject(p)));
      });
  }

  private loadWorkspaceSummary(): void {
    this.dashboardApi
      .getDashboard()
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => this.workspaceSummary.set(data));
  }

  private loadRemote(): void {
    this.getActiveProjects();
    this.loadWorkspaceSummary();

    this.dashboardApi
      .getActivity(1, 10)
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(activity => {
        if (!activity?.items) return;
        const items = activity.items.map(i => ({
          user: i.actorId,
          action: i.verb,
          task: i.metadata ?? i.targetKind ?? i.targetId,
          time: new Date(i.createdAt).toLocaleString(),
          avatar: (i.actorId ?? '').slice(0, 2).toUpperCase(),
        }));
        this.recentActivity.set(items as any);
      });
  }

  private toActiveProject(summary: ProjectSummaryDto): ActiveProject {
    return {
      id: summary.id,
      name: summary.name,
      progress: 0,
      team: summary.memberCount,
      tasks: 0,
      dueDate: summary.dueDate
        ? new Date(summary.dueDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : undefined,
    };
  }
}
