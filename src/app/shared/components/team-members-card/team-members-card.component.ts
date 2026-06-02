import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TeamMemberView {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly role: string;
  /** Secondary line under the name (e.g. email, title, description). */
  readonly secondary?: string;
}

@Component({
  selector: 'app-team-members-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-members-card.component.html',
  styleUrl: './team-members-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMembersCardComponent {
  readonly title = input('Team Members');
  readonly members = input<readonly TeamMemberView[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input('No team members yet.');
  /** Label for the add button; pass `null` to hide it. */
  readonly addLabel = input<string | null>('Add Member');
  readonly removeLabel = input('Remove');

  readonly add = output<void>();
  readonly remove = output<string>();

  trackById(_index: number, member: TeamMemberView): string {
    return member.id;
  }
}
