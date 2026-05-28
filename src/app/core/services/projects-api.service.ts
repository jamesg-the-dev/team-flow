import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AddMemberRequest,
  AddMemberResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  DeleteProjectResponse,
  GetProjectResponse,
  GetProjectStatsResponse,
  GetProjectVelocityQuery,
  GetProjectVelocityResponse,
  ListMembersResponse,
  ListProjectActivityQuery,
  ListProjectActivityResponse,
  ListProjectsQuery,
  ListProjectsResponse,
  RemoveMemberResponse,
  UpdateProjectMemberRequest,
  UpdateProjectMemberResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from '@shared/models/project-api';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly workspaceId = environment.workspaceId;
  private readonly base = `${environment.apiUrl}/api/v1/workspaces/${this.workspaceId}/projects`;

  list(query: ListProjectsQuery = {}): Observable<ListProjectsResponse> {
    return this.http.get<ListProjectsResponse>(this.base, {
      params: this.buildParams(query),
    });
  }

  get(id: string): Observable<GetProjectResponse> {
    return this.http.get<GetProjectResponse>(`${this.base}/${id}`);
  }

  create(payload: CreateProjectRequest): Observable<CreateProjectResponse> {
    return this.http.post<CreateProjectResponse>(this.base, payload);
  }

  update(id: string, payload: UpdateProjectRequest): Observable<UpdateProjectResponse> {
    return this.http.put<UpdateProjectResponse>(`${this.base}/${id}`, payload);
  }

  updateStatus(id: string, payload: ChangeStatusRequest): Observable<ChangeStatusResponse> {
    return this.http.post<ChangeStatusResponse>(`${this.base}/${id}/status`, payload);
  }

  remove(id: string): Observable<DeleteProjectResponse> {
    return this.http.delete<DeleteProjectResponse>(`${this.base}/${id}`);
  }

  // ---- Members ----------------------------------------------------------

  listMembers(id: string): Observable<ListMembersResponse> {
    return this.http.get<ListMembersResponse>(`${this.base}/${id}/members`);
  }

  addMember(id: string, payload: AddMemberRequest): Observable<AddMemberResponse> {
    return this.http.post<AddMemberResponse>(`${this.base}/${id}/members`, payload);
  }

  updateMember(
    id: string,
    userId: string,
    payload: UpdateProjectMemberRequest,
  ): Observable<UpdateProjectMemberResponse> {
    return this.http.patch<UpdateProjectMemberResponse>(
      `${this.base}/${id}/members/${userId}`,
      payload,
    );
  }

  removeMember(id: string, userId: string): Observable<RemoveMemberResponse> {
    return this.http.delete<RemoveMemberResponse>(`${this.base}/${id}/members/${userId}`);
  }

  // ---- Analytics --------------------------------------------------------

  activity(
    id: string,
    query: ListProjectActivityQuery = {},
  ): Observable<ListProjectActivityResponse> {
    return this.http.get<ListProjectActivityResponse>(`${this.base}/${id}/activity`, {
      params: this.buildParams(query),
    });
  }

  stats(id: string): Observable<GetProjectStatsResponse> {
    return this.http.get<GetProjectStatsResponse>(`${this.base}/${id}/stats`);
  }

  velocity(
    id: string,
    query: GetProjectVelocityQuery = { weeks: 12 },
  ): Observable<GetProjectVelocityResponse> {
    return this.http.get<GetProjectVelocityResponse>(`${this.base}/${id}/velocity`, {
      params: this.buildParams(query),
    });
  }

  // ---- Helpers ----------------------------------------------------------

  private buildParams(query: Record<string, unknown> | object): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }
}
