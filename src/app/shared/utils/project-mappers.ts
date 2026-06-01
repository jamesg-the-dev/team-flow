import {
  ProjectActivityEntry,
  ProjectDetails,
  ProjectProgressPoint,
  ProjectTeamMember,
} from '@shared/models';
import type { Project } from '../models/index';
import {
  PriorityLevel,
  ProjectActivityDto,
  ProjectDto,
  ProjectMemberDto,
  ProjectStatsDto,
  ProjectStatus,
  ProjectSummaryDto,
  VelocityPointDto,
} from '@shared/models/project-api';
import { getInitials } from './initials';

// ---------------------------------------------------------------------------
// Casing helpers — API uses PascalCase enums, UI uses lowercase tokens.
// ---------------------------------------------------------------------------

type UiStatus = Project['status'];

const STATUS_TO_UI: Record<ProjectStatus, UiStatus> = {
  Planning: 'planning',
  Active: 'active',
  OnHold: 'on-hold',
  Archived: 'archived',
  Completed: 'completed',
};

const STATUS_TO_API: Record<UiStatus, ProjectStatus> = {
  planning: 'Planning',
  active: 'Active',
  'on-hold': 'OnHold',
  archived: 'Archived',
  completed: 'Completed',
};

export const toUiStatus = (s: ProjectStatus): UiStatus => STATUS_TO_UI[s];
export const toApiStatus = (s: UiStatus): ProjectStatus => STATUS_TO_API[s];
// For UI display, just use PriorityLevel directly or map to a label if needed
export const toUiPriority = (p: PriorityLevel): string => p.toLowerCase();
export const toApiPriority = (p: string): PriorityLevel => {
  switch (p.toLowerCase()) {
    case 'low':
      return PriorityLevel.Low;
    case 'medium':
      return PriorityLevel.Medium;
    case 'high':
      return PriorityLevel.High;
    case 'critical':
      return PriorityLevel.Critical;
    default:
      throw new Error('Invalid priority: ' + p);
  }
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const FALLBACK_DATE = '—';

export function shortenGuid(id: string): string {
  return id.slice(0, 8);
}

function formatDate(value?: string | null): string {
  if (!value) return FALLBACK_DATE;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return FALLBACK_DATE;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatWeekLabel(weekStart: string): string {
  const date = new Date(weekStart);
  if (Number.isNaN(date.getTime())) return weekStart;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatBudget(cents: number | null, currency: string | null): string {
  if (cents === null || cents === undefined) return '—';
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency ?? 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency ?? 'USD'} ${amount.toFixed(0)}`;
  }
}

function progressFromStats(stats?: ProjectStatsDto): number {
  if (!stats || stats.totalTasks <= 0) return 0;
  return Math.round((stats.closedTasks / stats.totalTasks) * 100);
}

// ---------------------------------------------------------------------------
// DTO -> View model
// ---------------------------------------------------------------------------

/** Build a list-card item from the paged summary endpoint. */
export function summaryToProjectListItem(dto: ProjectSummaryDto): Project {
  return {
    id: dto.id,
    name: dto.name,
    description: `${dto.key}`,
    status: toUiStatus(dto.status),
    progress: 0,
    team: dto.memberNames.map(name => ({
      avatar: '',
      email: '',
      id: '',
      role: '',
      name: name,
      initials: getInitials(name),
    })),
    tasks: { total: 0, completed: 0 },
    dueDate: formatDate(dto.dueDate),
    priority: dto.priority,
    column: undefined as any,
  };
}

/** Build a list-card item from a freshly created/updated full project. */
export function projectDtoToListItem(dto: ProjectDto, memberCount = 0): Project {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    status: toUiStatus(dto.status),
    progress: 0,
    team: new Array(Math.min(memberCount, 5)).fill('•'),
    tasks: { total: 0, completed: 0 },
    dueDate: formatDate(dto.dueDate),
    priority: dto.priority,
    column: undefined as any, // or set a default TaskColumn if needed
  };
}

export function memberToTeamMember(member: ProjectMemberDto): ProjectTeamMember {
  const id = member.userId;
  const display = shortenGuid(id);
  return {
    id,
    name: display,
    avatar: display.slice(0, 2).toUpperCase(),
    role: member.role,
    email: '',
    initials: getInitials(display),
  };
}

export function activityToEntry(entry: ProjectActivityDto): ProjectActivityEntry {
  const actor = entry.actorId ? shortenGuid(entry.actorId) : 'System';
  return {
    id: String(entry.id),
    user: actor,
    avatar: actor.slice(0, 2).toUpperCase(),
    action: entry.verb,
    target: `${entry.targetKind} ${shortenGuid(entry.targetId)}`,
    time: formatRelative(entry.createdAt),
  };
}

export function velocityToProgressHistory(points: VelocityPointDto[]): ProjectProgressPoint[] {
  return points.map(p => ({ week: formatWeekLabel(p.weekStart), completed: p.completed }));
}

export function toProjectDetails(
  dto: ProjectDto,
  members: ProjectMemberDto[],
  stats: ProjectStatsDto | undefined,
  activity: ProjectActivityDto[],
  velocity: VelocityPointDto[],
): ProjectDetails {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    status: toUiStatus(dto.status),
    progress: progressFromStats(stats),
    priority: toUiPriority(dto.priority),
    startDate: dto.startDate ?? '',
    dueDate: dto.dueDate ?? '',
    budget: formatBudget(dto.budgetCents, dto.budgetCurrency),
    team: members.map(memberToTeamMember),
    tasks: {
      total: stats?.totalTasks ?? 0,
      completed: stats?.closedTasks ?? 0,
      inProgress: Math.max(0, (stats?.openTasks ?? 0) - (stats?.overdueTasks ?? 0)),
      todo: stats?.overdueTasks ?? 0,
    },
    tags: [],
    attachments: 0,
    comments: 0,
    progressHistory: velocityToProgressHistory(velocity),
    recentActivity: activity.map(activityToEntry),
  };
}
