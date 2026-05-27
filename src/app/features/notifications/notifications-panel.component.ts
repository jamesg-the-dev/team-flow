import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { NOTIFICATIONS } from '@shared/mocks/notifications.mock';
import { AppNotification, NotificationType } from '@shared/models';

type Tab = 'all' | 'unread' | 'archived';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTabsModule],
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanelComponent {
  @Output() readonly closed = new EventEmitter<void>();

  private readonly notifications = signal<readonly AppNotification[]>(NOTIFICATIONS);
  readonly activeTab = signal<Tab>('all');

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  readonly visible = computed(() => {
    switch (this.activeTab()) {
      case 'unread':
        return this.notifications().filter(n => !n.isRead);
      case 'archived':
        return [] as readonly AppNotification[];
      default:
        return this.notifications();
    }
  });

  iconFor(type: NotificationType): string {
    switch (type) {
      case 'mention':
        return 'alternate_email';
      case 'assignment':
        return 'person_add';
      case 'comment':
        return 'chat_bubble';
      case 'status':
        return 'task_alt';
    }
  }

  close(): void {
    this.closed.emit();
  }

  setTab(index: number): void {
    this.activeTab.set(index === 0 ? 'all' : index === 1 ? 'unread' : 'archived');
  }

  markAllRead(): void {
    this.notifications.update(current => current.map(n => ({ ...n, isRead: true })));
  }
}
