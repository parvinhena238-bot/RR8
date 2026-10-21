export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email?: string;
  password: string; // Login with only password
  role: UserRole;
  avatar: string;
  statusText: string;
  isOnline: boolean;
  lastSeen: string;
  isMuted?: boolean; // Admin can mute
  isFrozen?: boolean; // Admin can freeze
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string; // 'group-squad' or user id for 1-on-1
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  timestamp: string;
  isoDate: string;
  status: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isSystem?: boolean;
}

export interface SharedMedia {
  id: string;
  uploaderId: string;
  uploaderName: string;
  uploaderAvatar: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  album: string; // e.g., 'Hangouts', 'Trips', 'Memes', 'Birthdays'
  timestamp: string;
  likes: string[]; // array of userIds
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  }[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  createdBy: string;
  authorName: string;
  isActive: boolean;
  pinned: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
