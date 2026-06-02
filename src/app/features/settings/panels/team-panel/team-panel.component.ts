import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import {
  WorkspaceMemberDto,
  WorkspaceMembersApiService,
} from '@core/services/workspace-members-api.service';
import {
  TeamMembersCardComponent,
  TeamMemberView,
} from '@shared/components/team-members-card/team-members-card.component';
import { getInitials } from '@shared/utils/initials';

function toView(member: WorkspaceMemberDto): TeamMemberView {
  const name = member.fullName ?? 'Unknown';
  const title = member.title?.trim();
  return {
    id: member.userId,
    name,
    secondary: title || undefined,
    role: member.role,
    avatar: getInitials(name),
  };
}

@Component({
  selector: 'app-team-panel',
  standalone: true,
  imports: [TeamMembersCardComponent],
  templateUrl: './team-panel.component.html',
  styleUrl: './team-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPanelComponent {
  private readonly api = inject(WorkspaceMembersApiService);

  private readonly members = signal<WorkspaceMemberDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly team = computed<TeamMemberView[]>(() => this.members().map(toView));

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

  inviteMember(): void {
    // TODO: open invite-member dialog
  }

  removeMember(_userId: string): void {
    // TODO: wire up workspace member removal
  }
}
