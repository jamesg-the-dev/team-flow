import { AppNotification } from '@shared/models';

export const NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'Jessica Lee mentioned you',
    description: 'in #product-design: "Can you review the mockups?"',
    avatar: 'JL',
    timestamp: '5 min ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'assignment',
    title: 'You were assigned to a task',
    description: 'Database optimization in API Migration project',
    avatar: 'MJ',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    title: 'Sarah Chen commented',
    description: 'on Design new landing page: "Looks great!"',
    avatar: 'SC',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'status',
    title: 'Task completed',
    description: 'Fix mobile responsive issues was marked as done',
    avatar: 'ED',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'assignment',
    title: 'New task assigned',
    description: 'Write unit tests for authentication module',
    avatar: 'AK',
    timestamp: '5 hours ago',
    isRead: true,
  },
];
