// ---------------------------------------------------------------------------
// Kanban/Task API DTOs (from user-provided contract)
// ---------------------------------------------------------------------------

export enum TaskColumn {
  Backlog = "Backlog",
  Todo = "Todo",
  InProgress = "InProgress",
  Review = "Review",
  Done = "Done",
}


export enum PriorityLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export interface TaskDto {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description?: string;
  column: TaskColumn;
  priority: PriorityLevel;
  position: number;
  assigneeId?: string;
  reporterId: string;
  estimateHours?: number;
  dueDate?: string; // ISO date
  completedAt?: string; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface TaskBoardCardDto {
  id: string;
  number: number;
  title: string;
  column: TaskColumn;
  priority: PriorityLevel;
  position: number;
  assigneeId?: string;
  dueDate?: string; // ISO date
}

export interface TaskCommentDto {
  id: string;
  taskId: string;
  authorId: string;
  parentId?: string;
  body: string;
  createdAt: string; // ISO datetime
  editedAt?: string; // ISO datetime
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// REQUESTS
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: PriorityLevel;
  assigneeId?: string;
  estimateHours?: number;
  dueDate?: string; // ISO date
}

export interface MoveTaskRequest {
  targetColumn: TaskColumn;
  beforeTaskId?: string;
  afterTaskId?: string;
}

export interface AssignRequest {
  assigneeId?: string;
}

export interface AddCommentRequest {
  body: string;
  parentId?: string;
}

// ENDPOINT RESPONSES
export type GetProjectBoardResponse = Record<TaskColumn, TaskBoardCardDto[]>;
export type ListProjectTasksResponse = PagedResult<TaskDto>;
export type GetTaskByNumberResponse = TaskDto;
export type CreateTaskResponse = TaskDto;
export type GetTaskByIdResponse = TaskDto;
export type AddTaskCommentResponse = TaskCommentDto;
/**
 * DTOs and request/response shapes for the TeamFlow Projects API.
 *
 * Mirrors `/api/v1/workspaces/{workspaceId}/projects/...`.
 */

// ---------------------------------------------------------------------------
// Shared scalars
// ---------------------------------------------------------------------------

export type Guid = string;
/** ISO date string formatted "YYYY-MM-DD". */
export type DateOnly = string;
/** ISO 8601 datetime with offset. */
export type DateTimeOffset = string;

export type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'OnHold'
  | 'Archived'
  | 'Completed';


export type ProjectMemberRole = 'Lead' | 'Contributor' | 'Viewer';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ---------------------------------------------------------------------------
// Domain DTOs
// ---------------------------------------------------------------------------

export interface ProjectDto {
  id: Guid;
  workspaceId: Guid;
  key: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: PriorityLevel;
  startDate: DateOnly | null;
  dueDate: DateOnly | null;
  budgetCents: number | null;
  budgetCurrency: string | null;
  colorHex: string | null;
  createdAt: DateTimeOffset;
  updatedAt: DateTimeOffset;
}

export interface ProjectSummaryDto {
  id: Guid;
  key: string;
  name: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  dueDate: DateOnly | null;
  memberCount: number;
}

export interface ProjectMemberDto {
  userId: Guid;
  role: ProjectMemberRole;
  addedAt: DateTimeOffset;
}

export interface ProjectActivityDto {
  id: number;
  actorId: Guid | null;
  verb: string;
  targetKind: string;
  targetId: Guid;
  metadata: unknown;
  createdAt: DateTimeOffset;
}

export interface MemberWorkloadDto {
  userId: Guid | null;
  open: number;
  overdue: number;
}

export interface ProjectStatsDto {
  totalTasks: number;
  openTasks: number;
  closedTasks: number;
  overdueTasks: number;
  byColumn: Record<string, number>;
  byPriority: Record<string, number>;
  byAssignee: MemberWorkloadDto[];
}

export interface VelocityPointDto {
  weekStart: DateOnly;
  completed: number;
  created: number;
}

// ---------------------------------------------------------------------------
// Request / response envelopes
// ---------------------------------------------------------------------------

export interface ListProjectsQuery {
  status?: ProjectStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}
export type ListProjectsResponse = PagedResult<ProjectSummaryDto>;

export type GetProjectResponse = ProjectDto;

export interface CreateProjectRequest {
  key: string;
  name: string;
  description: string | null;
  priority: PriorityLevel;
  startDate: DateOnly | null;
  dueDate: DateOnly | null;
  colorHex: string | null;
}
export type CreateProjectResponse = ProjectDto;

export interface UpdateProjectRequest {
  name: string;
  description: string | null;
  priority: PriorityLevel;
  startDate: DateOnly | null;
  dueDate: DateOnly | null;
  colorHex: string | null;
}
export type UpdateProjectResponse = void;

export interface ChangeStatusRequest {
  status: ProjectStatus;
}
export type ChangeStatusResponse = void;

export interface AddMemberRequest {
  userId: Guid;
  role: ProjectMemberRole;
}
export type AddMemberResponse = void;

export type ListMembersResponse = ProjectMemberDto[];

export interface UpdateProjectMemberRequest {
  role: ProjectMemberRole;
}
export type UpdateProjectMemberResponse = void;

export type RemoveMemberResponse = void;
export type DeleteProjectResponse = void;

export interface ListProjectActivityQuery {
  page?: number;
  pageSize?: number;
}
export type ListProjectActivityResponse = PagedResult<ProjectActivityDto>;

export type GetProjectStatsResponse = ProjectStatsDto;

export interface GetProjectVelocityQuery {
  weeks?: number;
}
export type GetProjectVelocityResponse = VelocityPointDto[];
