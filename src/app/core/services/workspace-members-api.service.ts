import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { WorkspaceService } from './workspace.service';

export type WorkspaceMemberRole = 'Owner' | 'Admin' | 'Member' | string;

export interface WorkspaceMemberDto {
  userId: string;
  role: WorkspaceMemberRole;
  title: string | null;
  joinedAt: string;
  invitedBy: string | null;
  fullName: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceMembersApiService {
  private readonly http = inject(HttpClient);
  private readonly workspace = inject(WorkspaceService);
  private readonly base = `${this.workspace.base}/members`;

  getMembers(): Observable<WorkspaceMemberDto[]> {
    return this.http.get<WorkspaceMemberDto[]>(this.base);
  }
}
