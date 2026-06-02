import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { MeApiService, UserProfile } from '@core/services/me-api.service';
import { getInitials } from '@shared/utils/initials';

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
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  protected readonly profile = this.auth.profile;

  readonly avatarPath = computed(() => this.profile()?.avatarPath ?? null);

  readonly displayName = computed(() => {
    const p = this.profile();
    return p?.fullName?.trim() || this.auth.user()?.email || '';
  });

  readonly userInitials = computed(() => getInitials(this.displayName()));

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
