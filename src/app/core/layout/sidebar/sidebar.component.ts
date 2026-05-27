import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIconModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Projects', href: '/projects', icon: 'folder_open' },
    { label: 'Discussions', href: '/discussions', icon: 'forum' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];
}
