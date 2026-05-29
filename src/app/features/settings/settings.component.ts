import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SettingsSection {
  readonly path: 'profile' | 'notifications' | 'security' | 'appearance' | 'team' | 'billing';
  readonly name: string;
  readonly icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  readonly sections: readonly SettingsSection[] = [
    { path: 'profile', name: 'Profile', icon: 'person' },
    { path: 'notifications', name: 'Notifications', icon: 'notifications' },
    { path: 'security', name: 'Security', icon: 'shield' },
    { path: 'appearance', name: 'Appearance', icon: 'palette' },
    { path: 'team', name: 'Team', icon: 'group' },
    { path: 'billing', name: 'Billing', icon: 'credit_card' },
  ];
}
