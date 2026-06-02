import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';

import { DiscussionsApiService } from '@core/services/discussions-api.service';
import { ThemeService } from '@core/services/theme.service';
import { MessageDto, ReactionDto } from '@shared/models/discussions-api';
import { getInitials } from '@shared/utils/initials';

import { ChannelView, DiscussionsStateService } from '../discussions-state.service';

const QUICK_REACTIONS = ['👍', '🎉', '👀', '❤️', '😄', '🚀'] as const;

interface ReactionGroup {
  readonly emoji: string;
  readonly count: number;
  readonly userIds: readonly string[];
  readonly userNames: readonly string[];
  readonly reactedByMe: boolean;
}

interface MessageView {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorInitials: string;
  readonly body: string;
  readonly timestamp: string;
  readonly editedAt: string | null;
  readonly isPinned: boolean;
  readonly isMine: boolean;
  readonly replyCount: number;
  readonly reactions: readonly ReactionGroup[];
}

@Component({
  selector: 'app-discussions-thread',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './discussions-thread.component.html',
  styleUrl: './discussions-thread.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionsThreadComponent {
  private readonly api = inject(DiscussionsApiService);
  private readonly state = inject(DiscussionsStateService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  /** Bound from the `:channelId` route param via `withComponentInputBinding`. */
  readonly channelId = input.required<string>();

  readonly quickReactions = QUICK_REACTIONS;

  readonly currentUserId = this.state.currentUserId;
  readonly currentUserInitials = this.state.currentUserInitials;
  readonly selectedChannel = this.state.selectedChannel;

  readonly loadingMessages = signal(false);
  readonly sending = signal(false);
  readonly messages = signal<readonly MessageDto[]>([]);
  readonly expandedThreadIds = signal<ReadonlySet<string>>(new Set());
  readonly threads = signal<ReadonlyMap<string, readonly MessageDto[]>>(new Map());
  readonly editingMessageId = signal<string | null>(null);
  readonly replyTo = signal<MessageDto | null>(null);
  readonly pinsOpen = signal(false);
  readonly pinnedMessages = signal<readonly MessageDto[]>([]);
  readonly loadingPins = signal(false);
  readonly memberCount = signal(0);

  readonly messageControl = new FormControl('', { nonNullable: true });
  readonly editControl = new FormControl('', { nonNullable: true });
  private readonly messageValue = toSignal(this.messageControl.valueChanges, {
    initialValue: this.messageControl.value,
  });

  readonly emojiPickerOpen = signal(false);
  private readonly emojiPickerHost = viewChild<ElementRef<HTMLElement>>('emojiPickerHost');
  private emojiPickerInstance: HTMLElement | null = null;

  readonly canSend = computed(() => this.messageValue().trim().length > 0);

  readonly rootMessages = computed<readonly MessageView[]>(() =>
    this.messages()
      .filter(m => !m.parentId)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(m => this.toMessageView(m)),
  );

  readonly replyToView = computed<MessageView | null>(() => {
    const m = this.replyTo();
    return m ? this.toMessageView(m) : null;
  });

  readonly pinnedViews = computed<readonly MessageView[]>(() =>
    this.pinnedMessages().map(m => this.toMessageView(m)),
  );

  constructor() {
    toObservable(this.channelId)
      .pipe(
        distinctUntilChanged(),
        tap(id => {
          this.state.setSelectedChannel(id);
          this.resetChannelState();
          this.loadingMessages.set(true);
        }),
        switchMap(id =>
          this.api.listMessages(id, { take: 50 }).pipe(
            tap(list => this.messages.set(list)),
            catchError(() => {
              this.state.toast('Failed to load messages.');
              return EMPTY;
            }),
            finalize(() => this.loadingMessages.set(false)),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    toObservable(this.channelId)
      .pipe(
        distinctUntilChanged(),
        switchMap(id =>
          this.api.getChannel(id).pipe(
            tap(channel => this.memberCount.set(channel.memberCount)),
            catchError(() => EMPTY),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    effect(() => {
      const open = this.emojiPickerOpen();
      const host = this.emojiPickerHost()?.nativeElement;
      if (!open || !host) {
        this.disposeEmojiPicker();
        return;
      }
      this.mountEmojiPicker(host);
    });
  }

  // #region Emoji picker

  toggleEmojiPicker(): void {
    this.emojiPickerOpen.update(v => !v);
  }

  closeEmojiPicker(): void {
    this.emojiPickerOpen.set(false);
  }

  private async mountEmojiPicker(host: HTMLElement): Promise<void> {
    this.disposeEmojiPicker();
    const [{ Picker }, dataModule] = await Promise.all([
      import('emoji-mart'),
      import('@emoji-mart/data'),
    ]);
    if (!this.emojiPickerOpen()) return;
    const themeMode = this.theme.mode();
    const picker = new (Picker as unknown as new (options: Record<string, unknown>) => HTMLElement)(
      {
        data: (dataModule as { default: unknown }).default,
        onEmojiSelect: (emoji: { native?: string; shortcodes?: string }) => {
          const value = emoji.native ?? emoji.shortcodes ?? '';
          if (!value) return;
          const current = this.messageControl.value;
          this.messageControl.setValue(current ? `${current}${value}` : value);
          this.closeEmojiPicker();
        },
        onClickOutside: () => this.closeEmojiPicker(),
        theme: themeMode === 'system' ? 'auto' : themeMode,
        previewPosition: 'none',
        skinTonePosition: 'search',
        autoFocus: true,
      },
    );
    host.appendChild(picker);
    this.emojiPickerInstance = picker;
  }

  private disposeEmojiPicker(): void {
    if (this.emojiPickerInstance?.parentNode) {
      this.emojiPickerInstance.parentNode.removeChild(this.emojiPickerInstance);
    }
    this.emojiPickerInstance = null;
  }

  // #endregion

  // #region Loading

  private resetChannelState(): void {
    this.replyTo.set(null);
    this.editingMessageId.set(null);
    this.expandedThreadIds.set(new Set());
    this.threads.set(new Map());
    this.pinsOpen.set(false);
    this.pinnedMessages.set([]);
    this.messages.set([]);
    this.memberCount.set(0);
    this.messageControl.setValue('');
  }

  // #endregion

  // #region Composing & replies

  startReply(message: MessageView): void {
    const raw = this.messages().find(m => m.id === message.id) ?? null;
    if (!raw) return;
    this.replyTo.set(raw);
    if (raw.replyCount > 0) this.expandThread(raw.id);
  }

  cancelReply(): void {
    this.replyTo.set(null);
  }

  sendMessage(): void {
    const channelId = this.channelId();
    const body = this.messageControl.value.trim();
    if (!channelId || !body || this.sending()) return;

    const parent = this.replyTo();
    this.sending.set(true);
    this.api
      .postMessage(channelId, {
        body,
        parentMessageId: parent?.id ?? null,
        mentions: [],
      })
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: msg => {
          this.messages.update(list => [...list, msg]);
          if (parent) this.appendToThread(parent.id, msg);
          this.messageControl.setValue('');
          this.replyTo.set(null);
        },
        error: () => this.state.toast('Failed to send message.'),
      });
  }

  // #endregion

  // #region Threads

  toggleThread(parentId: string): void {
    if (this.expandedThreadIds().has(parentId)) {
      this.expandedThreadIds.update(s => {
        const next = new Set(s);
        next.delete(parentId);
        return next;
      });
      return;
    }
    this.expandThread(parentId);
  }

  private expandThread(parentId: string): void {
    this.expandedThreadIds.update(s => {
      const next = new Set(s);
      next.add(parentId);
      return next;
    });
    if (this.threads().has(parentId)) return;
    this.api.getThread(parentId).subscribe({
      next: list =>
        this.threads.update(m => {
          const next = new Map(m);
          next.set(
            parentId,
            list
              .filter(r => r.id !== parentId)
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
          );
          return next;
        }),
      error: () => this.state.toast('Failed to load replies.'),
    });
  }

  threadFor(parentId: string): readonly MessageView[] {
    return (this.threads().get(parentId) ?? []).map(m => this.toMessageView(m));
  }

  isThreadOpen(parentId: string): boolean {
    return this.expandedThreadIds().has(parentId);
  }

  private appendToThread(parentId: string, reply: MessageDto): void {
    this.threads.update(m => {
      const next = new Map(m);
      const existing = next.get(parentId) ?? [];
      next.set(parentId, [...existing, reply]);
      return next;
    });
    this.expandedThreadIds.update(s => {
      const next = new Set(s);
      next.add(parentId);
      return next;
    });
    this.updateMessageLocally(parentId, m => ({ ...m, replyCount: m.replyCount + 1 }));
  }

  // #endregion

  // #region Reactions

  toggleReaction(message: MessageView, emoji: string): void {
    const me = this.currentUserId();
    if (!me) return;
    const group = message.reactions.find(r => r.emoji === emoji);
    const mineAlready = group?.reactedByMe ?? false;
    const op$ = mineAlready
      ? this.api.removeReaction(message.id, emoji)
      : this.api.addReaction(message.id, { emoji });
    op$.subscribe({
      next: () =>
        this.updateMessageLocally(message.id, m =>
          mineAlready
            ? {
                ...m,
                reactions: m.reactions.filter(r => !(r.emoji === emoji && r.userId === me)),
              }
            : {
                ...m,
                reactions: [
                  ...m.reactions,
                  { emoji, userId: me, createdAt: new Date().toISOString() },
                ],
              },
        ),
      error: () => this.state.toast('Failed to update reaction.'),
    });
  }

  // #endregion

  // #region Message-level menu actions

  beginEdit(message: MessageView): void {
    this.editingMessageId.set(message.id);
    this.editControl.setValue(message.body);
  }

  cancelEdit(): void {
    this.editingMessageId.set(null);
    this.editControl.setValue('');
  }

  saveEdit(messageId: string): void {
    const body = this.editControl.value.trim();
    if (!body) return;
    this.api.editMessage(messageId, { body }).subscribe({
      next: updated => {
        this.updateMessageLocally(messageId, () => updated);
        this.replaceInThreads(updated);
        this.cancelEdit();
      },
      error: () => this.state.toast('Failed to update message.'),
    });
  }

  deleteMessage(message: MessageView): void {
    this.api.deleteMessage(message.id).subscribe({
      next: () => {
        this.messages.update(list => list.filter(m => m.id !== message.id));
        this.removeFromThreads(message.id);
      },
      error: () => this.state.toast('Failed to delete message.'),
    });
  }

  togglePin(message: MessageView): void {
    const op$ = message.isPinned
      ? this.api.unpinMessage(message.id)
      : this.api.pinMessage(message.id);
    op$.subscribe({
      next: () => {
        this.updateMessageLocally(message.id, m => ({ ...m, isPinned: !m.isPinned }));
        if (this.pinsOpen()) this.loadPins();
      },
      error: () => this.state.toast('Failed to update pin.'),
    });
  }

  // #endregion

  // #region Channel-level menu actions (delegate to shared state)

  toggleMute(channel: ChannelView): void {
    this.state.toggleMute(channel);
  }

  leaveChannel(channel: ChannelView): void {
    this.state.leaveChannel(channel, () => this.navigateAfterChannelGone());
  }

  deleteChannel(channel: ChannelView): void {
    this.state.deleteChannel(channel, () => this.navigateAfterChannelGone());
  }

  editTopic(channel: ChannelView): void {
    this.state.editTopic(channel);
  }

  openMembersDialog(channel: ChannelView): void {
    this.state.openMembersDialog(channel);
  }

  private navigateAfterChannelGone(): void {
    const next = this.state.channels()[0]?.id ?? null;
    void this.router.navigate(next ? ['/discussions', next] : ['/discussions']);
  }

  // #endregion

  // #region Pins panel

  togglePinsPanel(): void {
    const next = !this.pinsOpen();
    this.pinsOpen.set(next);
    if (next) this.loadPins();
  }

  private loadPins(): void {
    const channelId = this.channelId();
    if (!channelId) return;
    this.loadingPins.set(true);
    this.api
      .listPins(channelId)
      .pipe(finalize(() => this.loadingPins.set(false)))
      .subscribe({
        next: pins => this.pinnedMessages.set(pins),
        error: () => this.state.toast('Failed to load pinned messages.'),
      });
  }

  // #endregion

  // #region View-model mapping

  private toMessageView(m: MessageDto): MessageView {
    const authorName = this.state.displayNameFor(m.authorId);
    return {
      id: m.id,
      authorId: m.authorId,
      authorName,
      authorInitials: getInitials(authorName),
      body: m.body,
      timestamp: m.createdAt,
      editedAt: m.editedAt,
      isPinned: m.isPinned,
      isMine: m.authorId === this.currentUserId(),
      replyCount: m.replyCount,
      reactions: this.groupReactions(m.reactions),
    };
  }

  private groupReactions(reactions: readonly ReactionDto[]): readonly ReactionGroup[] {
    const me = this.currentUserId();
    const buckets = new Map<string, ReactionDto[]>();
    for (const r of reactions) {
      const arr = buckets.get(r.emoji);
      if (arr) arr.push(r);
      else buckets.set(r.emoji, [r]);
    }
    return Array.from(buckets.entries()).map(([emoji, list]) => {
      const userIds = list.map(r => r.userId);
      return {
        emoji,
        count: list.length,
        userIds,
        userNames: userIds.map(id => this.state.displayNameFor(id)),
        reactedByMe: me !== null && userIds.includes(me),
      };
    });
  }

  // #endregion

  // #region Local cache mutations

  private updateMessageLocally(id: string, fn: (m: MessageDto) => MessageDto): void {
    this.messages.update(list => list.map(m => (m.id === id ? fn(m) : m)));
    this.replaceInThreadsById(id, fn);
  }

  private replaceInThreads(updated: MessageDto): void {
    this.threads.update(m => {
      let changed = false;
      const next = new Map(m);
      for (const [parentId, list] of next) {
        const idx = list.findIndex(r => r.id === updated.id);
        if (idx >= 0) {
          const newList = list.slice();
          newList[idx] = updated;
          next.set(parentId, newList);
          changed = true;
        }
      }
      return changed ? next : m;
    });
  }

  private replaceInThreadsById(id: string, fn: (m: MessageDto) => MessageDto): void {
    this.threads.update(m => {
      let changed = false;
      const next = new Map(m);
      for (const [parentId, list] of next) {
        const idx = list.findIndex(r => r.id === id);
        if (idx >= 0) {
          const newList = list.slice();
          newList[idx] = fn(list[idx]);
          next.set(parentId, newList);
          changed = true;
        }
      }
      return changed ? next : m;
    });
  }

  private removeFromThreads(messageId: string): void {
    this.threads.update(m => {
      let changed = false;
      const next = new Map(m);
      for (const [parentId, list] of next) {
        const filtered = list.filter(r => r.id !== messageId);
        if (filtered.length !== list.length) {
          next.set(parentId, filtered);
          changed = true;
        }
      }
      return changed ? next : m;
    });
  }

  // #endregion
}
