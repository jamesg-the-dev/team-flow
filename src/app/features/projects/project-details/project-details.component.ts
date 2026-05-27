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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { map } from 'rxjs/operators';

import { ThemeService } from '@core/services/theme.service';
import { withAlpha } from '@shared/utils/color';
import { ProjectDetails } from '@shared/models';
import { findProjectDetails } from '@shared/mocks/project-details.mock';

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

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) },
  );

  /** Source-of-truth copy used to reset edits. */
  private readonly source = computed<ProjectDetails | undefined>(() =>
    findProjectDetails(this.routeId()),
  );

  /** Working copy displayed in the UI; edits mutate this. */
  readonly project = signal<ProjectDetails | undefined>(this.source());

  readonly activeTab = signal<TabKey>('overview');

  readonly tabs: readonly { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'team', label: 'Team' },
    { key: 'activity', label: 'Activity' },
    { key: 'settings', label: 'Settings' },
  ];

  constructor() {
    // Keep working copy in sync if the route id changes.
    this.route.paramMap.subscribe(() => this.project.set(this.source()));
  }

  readonly statusVariant = computed(() => {
    const s = this.project()?.status;
    return s === 'active' ? 'success' : s === 'planning' ? 'warning' : 'neutral';
  });

  readonly priorityVariant = computed(() => {
    const p = this.project()?.priority;
    return p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'neutral';
  });

  // ---- Chart ---------------------------------------------------------------

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
    // TODO: persist via API once available.
  }

  updateField<K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]): void {
    const current = this.project();
    if (!current) return;
    this.project.set({ ...current, [key]: value });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  trackTeam(_index: number, member: { id: number }): number {
    return member.id;
  }

  trackActivity(_index: number, item: { id: number }): number {
    return item.id;
  }
}
