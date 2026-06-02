import { Injectable, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { DiscussionsApiService } from '@core/services/discussions-api.service';
import {
  WorkspaceMemberDto,
  WorkspaceMembersApiService,
} from '@core/services/workspace-members-api.service';
import { MyChannelDto } from '@shared/models/discussions-api';
import { getInitials } from '@shared/utils/initials';

import {
  ChannelMembersDialogComponent,
  ChannelMembersDialogData,
} from './channel-members-dialog/channel-members-dialog.component';
import {
  NewChannelDialogComponent,
  NewChannelDialogData,
  NewChannelResult,
} from './new-channel-dialog/new-channel-dialog.component';

export interface ChannelView {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly topic: string | null;
  readonly type: MyChannelDto['type'];
  readonly unread: number;
  readonly isMuted: boolean;
  readonly lastMessageAt: string | null;
}

@Injectable()
export class DiscussionsStateService {
  private readonly api = inject(DiscussionsApiService);
  private readonly workspaceMembersApi = inject(WorkspaceMembersApiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly workspaceMembers = signal<readonly WorkspaceMemberDto[]>([]);
  readonly channels = signal<readonly MyChannelDto[]>([]);
  readonly selectedChannelId = signal<string | null>(null);
  readonly loadingChannels = signal(false);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly currentUserInitials = computed(() => getInitials(this.auth.profile()?.fullName ?? ''));

  readonly membersById = computed(() => {
    const map = new Map<string, WorkspaceMemberDto>();
    for (const m of this.workspaceMembers()) map.set(m.userId, m);
    return map;
  });

  readonly channelViews = computed<readonly ChannelView[]>(() =>
    this.channels().map(c => this.toChannelView(c)),
  );

  readonly selectedChannel = computed<ChannelView | null>(() => {
    const id = this.selectedChannelId();
    const found = this.channels().find(c => c.id === id);
    return found ? this.toChannelView(found) : null;
  });

  loadWorkspaceMembers(): void {
    this.workspaceMembersApi.getMembers().subscribe({
      next: members => this.workspaceMembers.set(members),
      error: () => {},
    });
  }

  loadChannels(): void {
    this.loadingChannels.set(true);
    this.api
      .listMyChannels()
      .pipe(finalize(() => this.loadingChannels.set(false)))
      .subscribe({
        next: channels => this.channels.set(channels),
        error: () => this.toast('Failed to load channels.'),
      });
  }

  setSelectedChannel(channelId: string | null): void {
    if (this.selectedChannelId() === channelId) return;
    this.selectedChannelId.set(channelId);
    if (channelId) this.markRead(channelId);
  }

  filterChannels(type: MyChannelDto['type'], search: string): readonly ChannelView[] {
    const query = search.toLowerCase().trim();
    return this.channelViews().filter(
      c => c.type === type && (!query || c.displayName.toLowerCase().includes(query)),
    );
  }

  toggleMute(channel: ChannelView): void {
    const op$ = channel.isMuted
      ? this.api.unmuteChannel(channel.id)
      : this.api.muteChannel(channel.id);
    op$.subscribe({
      next: () => this.patchChannel(channel.id, { isMuted: !channel.isMuted }),
      error: () => this.toast('Failed to update notification settings.'),
    });
  }

  leaveChannel(channel: ChannelView, onRemoved?: (id: string) => void): void {
    const me = this.currentUserId();
    if (!me) return;
    if (!confirm(`Leave #${channel.displayName}?`)) return;
    this.api.removeChannelMember(channel.id, me).subscribe({
      next: () => {
        this.removeChannelFromList(channel.id);
        onRemoved?.(channel.id);
      },
      error: () => this.toast('Failed to leave channel.'),
    });
  }

  deleteChannel(channel: ChannelView, onRemoved?: (id: string) => void): void {
    if (!confirm(`Delete #${channel.displayName}? This cannot be undone.`)) return;
    this.api.deleteChannel(channel.id).subscribe({
      next: () => {
        this.removeChannelFromList(channel.id);
        onRemoved?.(channel.id);
      },
      error: () => this.toast('Failed to delete channel.'),
    });
  }

  editTopic(channel: ChannelView): void {
    const topic = prompt('Channel topic', channel.topic ?? '');
    if (topic === null) return;
    const trimmed = topic.trim();
    this.api
      .updateChannel(channel.id, {
        name: null,
        topic: trimmed || null,
        clearTopic: trimmed.length === 0,
      })
      .subscribe({
        next: () => this.patchChannel(channel.id, { topic: trimmed || null }),
        error: () => this.toast('Failed to update topic.'),
      });
  }

  openMembersDialog(channel: ChannelView): void {
    this.dialog.open<ChannelMembersDialogComponent, ChannelMembersDialogData>(
      ChannelMembersDialogComponent,
      {
        autoFocus: false,
        data: {
          channelId: channel.id,
          channelName: channel.displayName,
          canManage: channel.type !== 'Direct',
          currentUserId: this.currentUserId(),
          workspaceMembers: this.workspaceMembers(),
        },
      },
    );
  }

  openNewChannelDialog(onCreated?: (id: string) => void): void {
    const open = () => {
      const ref = this.dialog.open<
        NewChannelDialogComponent,
        NewChannelDialogData,
        NewChannelResult
      >(NewChannelDialogComponent, {
        autoFocus: false,
        data: {
          currentUserId: this.currentUserId(),
          members: this.workspaceMembers(),
        },
      });
      ref.afterClosed().subscribe(result => {
        if (!result) return;
        if (result.kind === 'channel') {
          this.api
            .createChannel({ name: result.name, topic: result.topic, type: result.type })
            .subscribe({
              next: created => this.adoptChannel(created.id, onCreated),
              error: err => {
                const message = err?.error?.title ?? 'Failed to create channel.';
                this.toast(message);
              },
            });
        } else {
          this.api.createDm({ userId: result.userId }).subscribe({
            next: created => this.adoptChannel(created.id, onCreated),
            error: err => {
              const message = err?.error?.title ?? 'Failed to start DM.';
              this.toast(message);
            },
          });
        }
      });
    };

    if (this.workspaceMembers().length === 0) {
      this.workspaceMembersApi.getMembers().subscribe({
        next: members => {
          this.workspaceMembers.set(members);
          open();
        },
        error: () => open(),
      });
    } else {
      open();
    }
  }

  patchChannel(id: string, patch: Partial<MyChannelDto>): void {
    this.channels.update(list => list.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }

  displayNameFor(userId: string): string {
    const member = this.membersById().get(userId);
    if (member?.fullName) return member.fullName;
    if (userId === this.currentUserId()) {
      const profileName = this.auth.profile()?.fullName;
      if (profileName) return profileName;
    }
    return 'Unknown user';
  }

  toChannelView(c: MyChannelDto): ChannelView {
    return {
      id: c.id,
      name: c.name,
      displayName: c.name,
      topic: c.topic,
      type: c.type,
      unread: c.unreadCount,
      isMuted: c.isMuted,
      lastMessageAt: c.lastMessageAt,
    };
  }

  toast(message: string): void {
    this.snackbar.open(message, 'Dismiss', { duration: 3000 });
  }

  private markRead(channelId: string): void {
    this.api.markChannelRead(channelId).subscribe({
      next: () =>
        this.patchChannel(channelId, {
          unreadCount: 0,
          lastReadAt: new Date().toISOString(),
        }),
      error: () => {},
    });
  }

  private removeChannelFromList(channelId: string): void {
    this.channels.update(list => list.filter(c => c.id !== channelId));
  }

  private adoptChannel(channelId: string, onCreated?: (id: string) => void): void {
    this.api.listMyChannels().subscribe({
      next: channels => {
        this.channels.set(channels);
        onCreated?.(channelId);
      },
      error: () => this.toast('Channel created but failed to reload list.'),
    });
  }
}
