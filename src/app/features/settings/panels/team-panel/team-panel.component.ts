import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  WorkspaceMemberDto,
  WorkspaceMembersApiService,
} from '@core/services/workspace-members-api.service';
import { getInitials } from '@shared/utils/initials';

interface TeamMemberVm {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly role: string;
  readonly avatar: string;
}

function toVm(member: WorkspaceMemberDto): TeamMemberVm {
  const name = member.fullName ?? 'Unknown';
  return {
    id: member.userId,
    name,
    description: member.title?.trim() ?? '',
    role: member.role,
    avatar: getInitials(name),
  };
}

@Component({
  selector: 'app-team-panel',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './team-panel.component.html',
  styleUrl: './team-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPanelComponent {
  private readonly api = inject(WorkspaceMembersApiService);

  private readonly members = signal<WorkspaceMemberDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly team = computed<TeamMemberVm[]>(() => this.members().map(toVm));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMembers().subscribe({
      next: members => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load workspace members', err);
        this.error.set('Unable to load team members.');
        this.loading.set(false);
      },
    });
  }
}
