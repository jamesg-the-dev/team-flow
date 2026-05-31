import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateTaskRequest,
  MoveTaskRequest,
  AssignRequest,
  AddCommentRequest,
  GetProjectBoardResponse,
  ListProjectTasksResponse,
  GetTaskByNumberResponse,
  CreateTaskResponse,
  GetTaskByIdResponse,
  AddTaskCommentResponse,
} from '@shared/models/project-api';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getProjectBoard(projectId: string): Observable<GetProjectBoardResponse> {
    return this.http.get<GetProjectBoardResponse>(
      `${this.base}/api/v1/projects/${projectId}/board`,
    );
  }

  listProjectTasks(
    projectId: string,
    page = 1,
    pageSize = 50,
  ): Observable<ListProjectTasksResponse> {
    return this.http.get<ListProjectTasksResponse>(
      `${this.base}/api/v1/projects/${projectId}/tasks`,
      {
        params: { page, pageSize } as any,
      },
    );
  }

  getTaskByNumber(projectId: string, number: number): Observable<GetTaskByNumberResponse> {
    return this.http.get<GetTaskByNumberResponse>(
      `${this.base}/api/v1/projects/${projectId}/tasks/by-number/${number}`,
    );
  }

  createTask(projectId: string, req: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(
      `${this.base}/api/v1/projects/${projectId}/tasks`,
      req,
    );
  }

  getTaskById(id: string): Observable<GetTaskByIdResponse> {
    return this.http.get<GetTaskByIdResponse>(`${this.base}/api/v1/tasks/${id}`);
  }

  moveTask(id: string, req: MoveTaskRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/api/v1/tasks/${id}/move`, req);
  }

  assignTask(id: string, req: AssignRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/api/v1/tasks/${id}/assignee`, req);
  }

  addTaskComment(id: string, req: AddCommentRequest): Observable<AddTaskCommentResponse> {
    return this.http.post<AddTaskCommentResponse>(`${this.base}/api/v1/tasks/${id}/comments`, req);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/v1/tasks/${id}`);
  }
}
