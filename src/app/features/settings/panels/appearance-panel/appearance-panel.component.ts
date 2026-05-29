import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ThemeMode, ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-appearance-panel',
  standalone: true,
  imports: [MatCardModule, MatSlideToggleModule],
  templateUrl: './appearance-panel.component.html',
  styleUrl: './appearance-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearancePanelComponent {
  private readonly themeService = inject(ThemeService);

  readonly themeMode = this.themeService.mode;
  readonly themeOptions: readonly ThemeMode[] = ['light', 'dark', 'system'];

  setTheme(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
