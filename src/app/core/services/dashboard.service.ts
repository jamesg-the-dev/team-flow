import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { WorkspaceService } from './workspace.service';

export interface DashboardResponse {
  workspaceId: string;
  openTasksAssignedToMe: number;
  overdueTasksAssignedToMe: number;
  dueSoonTasksAssignedToMe: number;
  unreadNotifications: number;
  unreadChannels: number;
  myProjectsCount: number;
}

export interface ActivityItem {
  id: number;
  actorId: string;
  projectId: string;
  verb: string;
  targetKind: string;
  targetId: string;
  metadata: string;
  createdAt: string;
}

export interface ActivityResponse {
  items: ActivityItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly workspace = inject(WorkspaceService);
  private readonly base = `${this.workspace.base}`;

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.base}/dashboard`);
  }

  getActivity(page = 1, pageSize = 10): Observable<ActivityResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<ActivityResponse>(`${this.base}/activity`, { params });
  }
}
