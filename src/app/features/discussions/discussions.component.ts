import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CHANNEL_MESSAGES, CHANNELS } from '@shared/mocks/discussions.mock';
import { Channel, Message } from '@shared/models';

@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionsComponent {
  readonly channels = CHANNELS;
  readonly messages: readonly Message[] = CHANNEL_MESSAGES;

  readonly channelSearchControl = new FormControl('', { nonNullable: true });
  private readonly channelSearch = toSignal(this.channelSearchControl.valueChanges, {
    initialValue: this.channelSearchControl.value,
  });

  readonly messageControl = new FormControl('', { nonNullable: true });
  private readonly messageValue = toSignal(this.messageControl.valueChanges, {
    initialValue: this.messageControl.value,
  });
  readonly canSend = computed(() => this.messageValue().trim().length > 0);

  readonly selectedChannel = signal<Channel>(this.channels[1]);
  readonly replyTo = signal<Message | null>(null);

  readonly publicChannels = computed(() => this.filterChannels(false));
  readonly privateChannels = computed(() => this.filterChannels(true));

  private filterChannels(isPrivate: boolean): readonly Channel[] {
    const query = this.channelSearch().toLowerCase().trim();
    return this.channels.filter(
      c => c.isPrivate === isPrivate && (!query || c.name.toLowerCase().includes(query)),
    );
  }

  selectChannel(channel: Channel): void {
    this.selectedChannel.set(channel);
    this.replyTo.set(null);
  }

  startReply(message: Message): void {
    this.replyTo.set(message);
  }

  cancelReply(): void {
    this.replyTo.set(null);
  }

  sendMessage(): void {
    if (!this.canSend()) return;
    // Persist via API; for the showcase we just clear local state.
    this.messageControl.setValue('');
    this.replyTo.set(null);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
