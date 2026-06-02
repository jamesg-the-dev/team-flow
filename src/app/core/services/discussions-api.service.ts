import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { WorkspaceService } from './workspace.service';
import {
  AddChannelMemberRequest,
  ChannelDto,
  ChannelMemberDto,
  CreateChannelRequest,
  CreateDmRequest,
  EditMessageRequest,
  ListMessagesQuery,
  MessageDto,
  MyChannelDto,
  PostMessageRequest,
  ReactionRequest,
  UpdateChannelRequest,
} from '@shared/models/discussions-api';

@Injectable({ providedIn: 'root' })
export class DiscussionsApiService {
  private readonly http = inject(HttpClient);
  private readonly workspace = inject(WorkspaceService);
  private readonly apiBase = `${environment.apiUrl}/api/v1`;
  private readonly workspaceBase = this.workspace.base;

  listMyChannels(): Observable<MyChannelDto[]> {
    return this.http.get<MyChannelDto[]>(`${this.workspaceBase}/channels`);
  }

  createChannel(payload: CreateChannelRequest): Observable<ChannelDto> {
    return this.http.post<ChannelDto>(`${this.workspaceBase}/channels`, payload);
  }

  createDm(payload: CreateDmRequest): Observable<ChannelDto> {
    return this.http.post<ChannelDto>(`${this.workspaceBase}/dms`, payload);
  }

  getChannel(id: string): Observable<ChannelDto> {
    return this.http.get<ChannelDto>(`${this.apiBase}/channels/${id}`);
  }

  updateChannel(id: string, payload: UpdateChannelRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiBase}/channels/${id}`, payload);
  }

  deleteChannel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/channels/${id}`);
  }

  listChannelMembers(id: string): Observable<ChannelMemberDto[]> {
    return this.http.get<ChannelMemberDto[]>(`${this.apiBase}/channels/${id}/members`);
  }

  addChannelMember(id: string, payload: AddChannelMemberRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/channels/${id}/members`, payload);
  }

  removeChannelMember(id: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/channels/${id}/members/${userId}`);
  }

  markChannelRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/channels/${id}/read`, {});
  }

  muteChannel(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/channels/${id}/mute`, {});
  }

  unmuteChannel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/channels/${id}/mute`);
  }

  listMessages(channelId: string, query: ListMessagesQuery = {}): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.apiBase}/channels/${channelId}/messages`, {
      params: this.buildParams({ take: query.take ?? 50, before: query.before }),
    });
  }

  postMessage(channelId: string, payload: PostMessageRequest): Observable<MessageDto> {
    return this.http.post<MessageDto>(`${this.apiBase}/channels/${channelId}/messages`, payload);
  }

  listPins(channelId: string): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.apiBase}/channels/${channelId}/pins`);
  }

  getMessage(id: string): Observable<MessageDto> {
    return this.http.get<MessageDto>(`${this.apiBase}/messages/${id}`);
  }

  editMessage(id: string, payload: EditMessageRequest): Observable<MessageDto> {
    return this.http.patch<MessageDto>(`${this.apiBase}/messages/${id}`, payload);
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/messages/${id}`);
  }

  getThread(id: string): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.apiBase}/messages/${id}/thread`);
  }

  pinMessage(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/messages/${id}/pin`, {});
  }

  unpinMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/messages/${id}/pin`);
  }

  addReaction(id: string, payload: ReactionRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/messages/${id}/reactions`, payload);
  }

  removeReaction(id: string, emoji: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBase}/messages/${id}/reactions/${encodeURIComponent(emoji)}`,
    );
  }

  private buildParams(query: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }
}
