import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TEAM_MEMBERS } from '@shared/mocks/settings.mock';

@Component({
  selector: 'app-team-panel',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './team-panel.component.html',
  styleUrl: './team-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPanelComponent {
  readonly team = TEAM_MEMBERS;
}
