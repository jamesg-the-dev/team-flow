/**
 * Shared domain models for the TeamFlow showcase.
 * Replace these with API-generated types once the backend is wired in.
 */

export type Priority = 'low' | 'medium' | 'high';

export type TaskColumn = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: Priority;
  labels: string[];
  comments: number;
  attachments: number;
  dueDate?: string;
  column: TaskColumn;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'archived';
  progress: number;
  team: string[];
  tasks: { total: number; completed: number };
  dueDate: string;
  priority: Priority;
}

export interface ProjectTeamMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface ProjectActivityEntry {
  id: number;
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
  id: number;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'archived';
  progress: number;
  priority: Priority;
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
