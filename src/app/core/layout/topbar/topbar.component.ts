import { OverlayModule } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from '@core/services/theme.service';
import { NotificationsPanelComponent } from '@features/notifications/notifications-panel.component';
import { NOTIFICATIONS } from '@shared/mocks/notifications.mock';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    OverlayModule,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    NotificationsPanelComponent,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly themeService = inject(ThemeService);

  readonly themeMode = this.themeService.mode;
  readonly notificationsOpen = signal(false);
  readonly unreadCount = computed(() => NOTIFICATIONS.filter(n => !n.isRead).length);

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleNotifications(): void {
    this.notificationsOpen.update(open => !open);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }
}
