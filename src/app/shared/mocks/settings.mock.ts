export interface TeamMember {
  readonly name: string;
  readonly email: string;
  readonly role: 'Owner' | 'Admin' | 'Member';
  readonly avatar: string;
}

export interface NotificationPreference {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
}

export interface ActiveSession {
  readonly id: string;
  readonly device: string;
  readonly location: string;
  readonly time: string;
  readonly current: boolean;
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { name: 'John Doe', email: 'john@acme.com', role: 'Owner', avatar: 'JD' },
  { name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Admin', avatar: 'SC' },
  { name: 'Mike Johnson', email: 'mike@acme.com', role: 'Member', avatar: 'MJ' },
  { name: 'Emily Davis', email: 'emily@acme.com', role: 'Member', avatar: 'ED' },
  { name: 'Alex Kumar', email: 'alex@acme.com', role: 'Member', avatar: 'AK' },
];

export const EMAIL_NOTIFICATIONS: readonly NotificationPreference[] = [
  {
    id: 'task-assignments',
    label: 'Task assignments',
    description: 'Get notified when you are assigned to a task',
    enabled: true,
  },
  {
    id: 'comments-mentions',
    label: 'Comments & mentions',
    description: 'Get notified when someone mentions you or comments',
    enabled: true,
  },
  {
    id: 'status-updates',
    label: 'Status updates',
    description: 'Get notified about project and task status changes',
    enabled: true,
  },
  {
    id: 'weekly-digest',
    label: 'Weekly digest',
    description: 'Receive a weekly summary of your activity',
    enabled: true,
  },
];

export const PUSH_NOTIFICATIONS: readonly NotificationPreference[] = [
  {
    id: 'desktop',
    label: 'Desktop notifications',
    description: 'Show desktop notifications for new activity',
    enabled: true,
  },
  {
    id: 'mobile',
    label: 'Mobile notifications',
    description: 'Receive push notifications on mobile devices',
    enabled: true,
  },
];

export const ACTIVE_SESSIONS: readonly ActiveSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    location: 'San Francisco, CA',
    time: 'Current session',
    current: true,
  },
  {
    id: '2',
    device: 'iPhone 15',
    location: 'San Francisco, CA',
    time: '2 hours ago',
    current: false,
  },
];
