import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

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
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly userInitials = computed(() => {
    const u = this.auth.user();
    const metadata = (u?.user_metadata ?? {}) as { name?: string };
    const source = metadata.name?.trim() || u?.email || '';
    if (!source) {
      return '?';
    }
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
    return initials || source.charAt(0).toUpperCase();
  });

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Projects', href: '/projects', icon: 'folder_open' },
    { label: 'Discussions', href: '/discussions', icon: 'forum' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ];

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
