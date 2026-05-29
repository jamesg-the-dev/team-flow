import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  displayName: string | null;
  avatarPath: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  fullName: string | null;
  displayName: string | null;
  avatarPath: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;
}

@Injectable({ providedIn: 'root' })
export class MeApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/me`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/profile`);
  }

  updateProfile(payload: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/profile`, payload);
  }
}
