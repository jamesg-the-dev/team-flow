import { TaskColumn } from '@shared/models/project-api';
import { Task } from '@shared/models/index';
import { PriorityLevel } from '@shared/models/project-api';

export interface KanbanColumn {
  readonly id: TaskColumn;
  readonly title: string;
  /** CSS color token used for the column's status dot. */
  readonly accent: string;
}

export const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  { id: TaskColumn.Backlog, title: 'Backlog', accent: 'var(--sys-outline)' },
  { id: TaskColumn.Todo, title: 'To Do', accent: '#3b82f6' },
  { id: TaskColumn.InProgress, title: 'In Progress', accent: '#f59e0b' },
  { id: TaskColumn.Review, title: 'Review', accent: 'var(--sys-tertiary)' },
  { id: TaskColumn.Done, title: 'Done', accent: '#10b981' },
];

export const INITIAL_TASKS: readonly Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create mockups for the new marketing site',
    assignee: 'SC',
    priority: PriorityLevel.High,
    labels: ['Design', 'Marketing'],
    comments: 5,
    attachments: 3,
    dueDate: 'May 28',
    column: TaskColumn.Todo,
  },
  {
    id: '2',
    title: 'Implement user authentication',
    assignee: 'MJ',
    priority: PriorityLevel.High,
    labels: ['Backend', 'Security'],
    comments: 12,
    attachments: 0,
    dueDate: 'May 27',
    column: TaskColumn.InProgress,
  },
  {
    id: '3',
    title: 'Write API documentation',
    assignee: 'AK',
    priority: PriorityLevel.Medium,
    labels: ['Documentation'],
    comments: 3,
    attachments: 1,
    column: TaskColumn.InProgress,
  },
  {
    id: '4',
    title: 'Fix mobile responsive issues',
    assignee: 'ED',
    priority: PriorityLevel.High,
    labels: ['Frontend', 'Bug'],
    comments: 8,
    attachments: 2,
    dueDate: 'May 26',
    column: TaskColumn.Review,
  },
  {
    id: '5',
    title: 'Database schema optimization',
    assignee: 'JL',
    priority: PriorityLevel.Low,
    labels: ['Backend', 'Performance'],
    comments: 2,
    attachments: 0,
    column: TaskColumn.Done,
  },
  {
    id: '6',
    title: 'Update dependencies',
    priority: PriorityLevel.Low,
    labels: ['Maintenance'],
    comments: 0,
    attachments: 0,
    column: TaskColumn.Backlog,
  },
  {
    id: '7',
    title: 'Conduct user interviews',
    assignee: 'SC',
    priority: PriorityLevel.Medium,
    labels: ['Research', 'UX'],
    comments: 4,
    attachments: 5,
    dueDate: 'Jun 1',
    column: TaskColumn.Todo,
  },
  {
    id: '8',
    title: 'Set up CI/CD pipeline',
    assignee: 'AK',
    priority: PriorityLevel.High,
    labels: ['DevOps'],
    comments: 6,
    attachments: 1,
    column: TaskColumn.InProgress,
  },
];

export interface TaskComment {
  readonly id: string;
  readonly author: string;
  readonly avatar: string;
  readonly content: string;
  readonly timestamp: string;
  readonly reactions?: readonly { emoji: string; count: number }[];
}

export interface TaskActivity {
  readonly id: string;
  readonly type: 'status' | 'assignee' | 'comment' | 'attachment';
  readonly author: string;
  readonly avatar: string;
  readonly content: string;
  readonly timestamp: string;
}

export const TASK_COMMENTS: readonly TaskComment[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    avatar: 'SC',
    content: "I've started working on the mockups. Should have the first draft ready by EOD.",
    timestamp: '2 hours ago',
    reactions: [
      { emoji: '👍', count: 3 },
      { emoji: '🎉', count: 1 },
    ],
  },
  {
    id: '2',
    author: 'Mike Johnson',
    avatar: 'MJ',
    content: 'Looks great! Can we also include the mobile version in this iteration?',
    timestamp: '1 hour ago',
    reactions: [{ emoji: '👍', count: 2 }],
  },
  {
    id: '3',
    author: 'Emily Davis',
    avatar: 'ED',
    content: 'I can help with the responsive design if needed. Let me know!',
    timestamp: '45 min ago',
  },
];

export const TASK_ACTIVITY: readonly TaskActivity[] = [
  {
    id: '1',
    type: 'status',
    author: 'Sarah Chen',
    avatar: 'SC',
    content: 'moved this task to In Progress',
    timestamp: '3 hours ago',
  },
  {
    id: '2',
    type: 'assignee',
    author: 'Mike Johnson',
    avatar: 'MJ',
    content: 'assigned this to Sarah Chen',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    type: 'comment',
    author: 'Emily Davis',
    avatar: 'ED',
    content: 'added a comment',
    timestamp: '45 min ago',
  },
  {
    id: '4',
    type: 'attachment',
    author: 'Sarah Chen',
    avatar: 'SC',
    content: 'attached mockup-v1.fig',
    timestamp: '2 hours ago',
  },
];
