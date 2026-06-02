import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly workspaceId = environment.workspaceId;
  readonly base = `${environment.apiUrl}/api/v1/workspaces/${this.workspaceId}`;

}
