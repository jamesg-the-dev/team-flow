import { TaskColumn, PriorityLevel } from './project-api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: PriorityLevel;
  comments: number;
  attachments: number;
  dueDate?: string;
  column: TaskColumn;
  labels?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed' | 'archived';
  progress: number;
  team: string[];
  dueDate: string;
  priority: PriorityLevel;
  column: TaskColumn;
  tasks?: { total: number; completed: number };
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface ProjectActivityEntry {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

export interface ProjectProgressPoint {
  week: string;
  completed: number;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed' | 'archived';
  progress: number;
  priority: string;
  startDate: string;
  dueDate: string;
  budget: string;
  team: ProjectTeamMember[];
  tasks: { total: number; completed: number; inProgress: number; todo: number };
  tags: string[];
  attachments: number;
  comments: number;
  progressHistory: ProjectProgressPoint[];
  recentActivity: ProjectActivityEntry[];
}

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  unread?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions?: MessageReaction[];
  replies?: Message[];
  isPinned?: boolean;
}

export type NotificationType = 'mention' | 'assignment' | 'comment' | 'status';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  avatar: string;
  timestamp: string;
  isRead: boolean;
}
