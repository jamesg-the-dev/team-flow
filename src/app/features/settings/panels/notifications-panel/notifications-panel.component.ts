import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { EMAIL_NOTIFICATIONS, PUSH_NOTIFICATIONS } from '@shared/mocks/settings.mock';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [MatCardModule, MatSlideToggleModule],
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanelComponent {
  readonly emailPrefs = EMAIL_NOTIFICATIONS;
  readonly pushPrefs = PUSH_NOTIFICATIONS;
}
