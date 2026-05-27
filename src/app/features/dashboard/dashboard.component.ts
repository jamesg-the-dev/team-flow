import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { ThemeService } from '@core/services/theme.service';
import { withAlpha } from '@shared/utils/color';
import {
  ACTIVE_PROJECTS,
  ACTIVITY_DATA,
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
  VELOCITY_DATA,
} from '@shared/mocks/dashboard.mock';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: {
    class: 'flex-auto'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly theme = inject(ThemeService);

  readonly stats = signal(DASHBOARD_STATS);
  readonly recentActivity = signal(RECENT_ACTIVITY);
  readonly activeProjects = signal(ACTIVE_PROJECTS);

  readonly tasksChartType: ChartConfiguration<'bar'>['type'] = 'bar';

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
}
