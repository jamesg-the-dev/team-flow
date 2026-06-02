import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';

import { DiscussionsStateService } from './discussions-state.service';

@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterOutlet,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  providers: [DiscussionsStateService],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionsComponent {
  protected readonly state = inject(DiscussionsStateService);
  private readonly router = inject(Router);

  readonly channelSearchControl = new FormControl('', { nonNullable: true });
  private readonly channelSearch = toSignal(this.channelSearchControl.valueChanges, {
    initialValue: this.channelSearchControl.value,
  });

  readonly loadingChannels = this.state.loadingChannels;
  readonly selectedChannelId = this.state.selectedChannelId;

  readonly publicChannels = computed(() =>
    this.state.filterChannels('Public', this.channelSearch()),
  );
  readonly privateChannels = computed(() =>
    this.state.filterChannels('Private', this.channelSearch()),
  );
  readonly directChannels = computed(() =>
    this.state.filterChannels('Direct', this.channelSearch()),
  );

  constructor() {
    this.state.loadWorkspaceMembers();
    this.state.loadChannels();
  }

  selectChannel(channelId: string): void {
    if (this.selectedChannelId() === channelId) return;
    void this.router.navigate(['/discussions', channelId]);
  }

  openNewChannelDialog(): void {
    this.state.openNewChannelDialog(id => {
      void this.router.navigate(['/discussions', id]);
    });
  }
}
