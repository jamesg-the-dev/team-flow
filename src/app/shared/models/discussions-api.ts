// ---------------------------------------------------------------------------
// Channels & Messages API DTOs
// ---------------------------------------------------------------------------

export type ChannelType = 'Public' | 'Private' | 'Direct';

export interface ChannelDto {
  id: string;
  workspaceId: string;
  name: string;
  topic: string | null;
  type: ChannelType;
  createdBy: string;
  createdAt: string;
  memberCount: number;
}

export interface MyChannelDto {
  id: string;
  name: string;
  topic: string | null;
  type: ChannelType;
  createdAt: string;
  lastReadAt: string;
  isMuted: boolean;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface ChannelMemberDto {
  userId: string;
  joinedAt: string;
  lastReadAt: string;
  isMuted: boolean;
}

export interface CreateChannelRequest {
  name: string;
  topic: string | null;
  type: ChannelType;
}

export interface UpdateChannelRequest {
  name: string | null;
  topic: string | null;
  clearTopic: boolean;
}

export interface AddChannelMemberRequest {
  userId: string;
}

export interface CreateDmRequest {
  userId: string;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface ReactionDto {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessageDto {
  id: string;
  channelId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  isPinned: boolean;
  createdAt: string;
  editedAt: string | null;
  reactions: ReactionDto[];
  mentions: string[];
  replyCount: number;
}

export interface PostMessageRequest {
  body: string;
  parentMessageId: string | null;
  mentions: string[];
}

export interface EditMessageRequest {
  body: string;
}

export interface ReactionRequest {
  emoji: string;
}

export interface ListMessagesQuery {
  before?: string; // ISO datetime
  take?: number;
}
