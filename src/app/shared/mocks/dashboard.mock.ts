export type StatVariant = 'success' | 'warning' | 'danger';

export interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly icon: string;
  readonly variant: StatVariant;
}

export interface ActivityPoint {
  readonly name: string;
  readonly tasks: number;
}

export interface VelocityPoint {
  readonly week: string;
  readonly velocity: number;
}

export interface RecentActivity {
  readonly user: string;
  readonly action: string;
  readonly task: string;
  readonly time: string;
  readonly avatar: string;
}

export interface ActiveProject {
  readonly name: string;
  readonly progress: number;
  readonly team: number;
  readonly tasks: number;
  readonly dueDate: string;
}

export const DASHBOARD_STATS: readonly DashboardStat[] = [
  {
    label: 'Active Projects',
    value: '12',
    change: '+2 this week',
    icon: 'trending_up',
    variant: 'success',
  },
  {
    label: 'Tasks Completed',
    value: '47',
    change: '+12 today',
    icon: 'check_circle',
    variant: 'success',
  },
  {
    label: 'In Progress',
    value: '23',
    change: '8 due today',
    icon: 'schedule',
    variant: 'warning',
  },
  { label: 'Overdue', value: '5', change: 'Needs attention', icon: 'error', variant: 'danger' },
];

export const ACTIVITY_DATA: readonly ActivityPoint[] = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 25 },
  { name: 'Fri', tasks: 22 },
  { name: 'Sat', tasks: 8 },
  { name: 'Sun', tasks: 5 },
];

export const VELOCITY_DATA: readonly VelocityPoint[] = [
  { week: 'W1', velocity: 34 },
  { week: 'W2', velocity: 42 },
  { week: 'W3', velocity: 38 },
  { week: 'W4', velocity: 51 },
];

export const RECENT_ACTIVITY: readonly RecentActivity[] = [
  {
    user: 'Sarah Chen',
    action: 'completed',
    task: 'Design system updates',
    time: '5 min ago',
    avatar: 'SC',
  },
  {
    user: 'Mike Johnson',
    action: 'commented on',
    task: 'API integration',
    time: '12 min ago',
    avatar: 'MJ',
  },
  {
    user: 'Emily Davis',
    action: 'created',
    task: 'User authentication flow',
    time: '1 hour ago',
    avatar: 'ED',
  },
  {
    user: 'Alex Kumar',
    action: 'moved',
    task: 'Database optimization',
    time: '2 hours ago',
    avatar: 'AK',
  },
  {
    user: 'Jessica Lee',
    action: 'completed',
    task: 'Mobile responsive fixes',
    time: '3 hours ago',
    avatar: 'JL',
  },
];

export const ACTIVE_PROJECTS: readonly ActiveProject[] = [
  { name: 'Product Redesign', progress: 75, team: 5, tasks: 24, dueDate: 'May 30' },
  { name: 'Mobile App v2', progress: 45, team: 8, tasks: 38, dueDate: 'Jun 15' },
  { name: 'API Migration', progress: 90, team: 3, tasks: 12, dueDate: 'May 28' },
  { name: 'Marketing Website', progress: 30, team: 4, tasks: 19, dueDate: 'Jul 1' },
];
