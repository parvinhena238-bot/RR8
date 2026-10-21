import { User, ChatMessage, SharedMedia, Notice, ActivityLog } from '../types';

const USERS_STORAGE_KEY = 'friendsquad_users_v2';
const MESSAGES_STORAGE_KEY = 'friendsquad_messages_v2';
const MEDIA_STORAGE_KEY = 'friendsquad_media_v2';
const NOTICES_STORAGE_KEY = 'friendsquad_notices_v2';
const ACTIVITY_STORAGE_KEY = 'friendsquad_activity_v2';
const CURRENT_USER_KEY = 'friendsquad_active_user_id_v2';

// Clean up old v1 storage containing pre-installed dummy people
try {
  localStorage.removeItem('friendsquad_users_v1');
  localStorage.removeItem('friendsquad_messages_v1');
  localStorage.removeItem('friendsquad_media_v1');
  localStorage.removeItem('friendsquad_notices_v1');
  localStorage.removeItem('friendsquad_activity_v1');
  localStorage.removeItem('friendsquad_active_user_id');
} catch (e) {
  // Ignore
}

// Broadcast channel for multi-tab synchronization
let syncChannel: BroadcastChannel | null = null;
try {
  syncChannel = new BroadcastChannel('friendsquad_sync_channel');
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

// Only Admin Parvin is created initially. NO pre-installed dummy people!
// Other friends join by creating their own password login.
export const INITIAL_USERS: User[] = [
  {
    id: 'user_parvin',
    name: 'Parvin (Admin)',
    email: 'parvinhena238@gmail.com',
    password: 'admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    statusText: 'Admin 👑 | Squad organizer',
    isOnline: true,
    lastSeen: 'Online',
    joinedAt: new Date().toISOString().split('T')[0],
  },
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_1',
    title: '📢 Squad Notice Board',
    content: 'Welcome to FriendSquad! Chat with friends and upload photos/videos to the album. Anyone can download any photo in full resolution.',
    priority: 'important',
    createdAt: new Date().toISOString(),
    createdBy: 'user_parvin',
    authorName: 'Parvin (Admin)',
    isActive: true,
    pinned: true,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_sys_1',
    chatId: 'group-squad',
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '',
    text: '🎉 Welcome to Squad HQ! Everyone who joins with a password will automatically appear here.',
    timestamp: '12:00 PM',
    isoDate: new Date().toISOString(),
    status: 'read',
    isSystem: true,
  },
];

const INITIAL_MEDIA: SharedMedia[] = [];

const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: 'act_init',
    userId: 'user_parvin',
    userName: 'Parvin (Admin)',
    action: 'Squad Created',
    details: 'Initialized private chat and photo album',
    timestamp: 'Just now',
  },
];

// Helper to notify other tabs
export function broadcastEvent(type: string, payload?: any) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {
      console.warn('Failed to broadcast event', e);
    }
  }
}

// Storage Access Functions
export function getStoredUsers(): User[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  broadcastEvent('USERS_UPDATED', users);
}

export function getStoredMessages(): ChatMessage[] {
  const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MESSAGES;
  }
}

export function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  broadcastEvent('MESSAGES_UPDATED', messages);
}

export function getStoredMedia(): SharedMedia[] {
  const data = localStorage.getItem(MEDIA_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA));
    return INITIAL_MEDIA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MEDIA;
  }
}

export function saveMedia(media: SharedMedia[]) {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
  broadcastEvent('MEDIA_UPDATED', media);
}

export function getStoredNotices(): Notice[] {
  const data = localStorage.getItem(NOTICES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(INITIAL_NOTICES));
    return INITIAL_NOTICES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_NOTICES;
  }
}

export function saveNotices(notices: Notice[]) {
  localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));
  broadcastEvent('NOTICES_UPDATED', notices);
}

export function getStoredActivity(): ActivityLog[] {
  const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITY));
    return INITIAL_ACTIVITY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ACTIVITY;
  }
}

export function logActivity(userId: string, userName: string, action: string, details: string) {
  const activities = getStoredActivity();
  const now = new Date();
  const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const newLog: ActivityLog = {
    id: 'act_' + Date.now() + Math.random().toString(36).substring(2, 6),
    userId,
    userName,
    action,
    details,
    timestamp: timeStr,
  };
  const updated = [newLog, ...activities].slice(0, 50);
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
  broadcastEvent('ACTIVITY_UPDATED', updated);
}

// Current User Session
export function getActiveUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setActiveUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Login by Password Only
export function loginWithPassword(password: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const cleaned = password.trim();
  const match = users.find((u) => u.password === cleaned || u.password.toLowerCase() === cleaned.toLowerCase());

  if (!match) {
    return { success: false, error: 'Incorrect password! If you are new, click "New Member? Join with Password" above to create your account.' };
  }

  if (match.isFrozen) {
    return { success: false, error: 'This account has been frozen by Admin Parvin.' };
  }

  // Update online status
  match.isOnline = true;
  match.lastSeen = 'Online';
  saveUsers(users);
  setActiveUserId(match.id);
  logActivity(match.id, match.name, 'Logged In', 'Signed in with password');

  return { success: true, user: match };
}

// Join / Register New Member with Password Only
export function registerWithPasswordOnly(params: {
  password: string;
  name?: string;
  avatar?: string;
  statusText?: string;
}): { success: boolean; user?: User; error?: string } {
  const trimmed = params.password.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, error: 'Please enter a password of at least 2 characters.' };
  }

  const users = getStoredUsers();
  // Check if password already taken
  const existing = users.find((u) => u.password.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    return { success: false, error: 'This password is already registered to an existing account. Please sign in or choose another password.' };
  }

  const newId = 'user_friend_' + Date.now().toString(36);
  const friendNumber = users.length + 1;
  const displayName = params.name?.trim() || `Friend #${friendNumber}`;
  const avatarUrl =
    params.avatar ||
    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

  const newUser: User = {
    id: newId,
    name: displayName,
    password: trimmed,
    role: 'member',
    avatar: avatarUrl,
    statusText: params.statusText?.trim() || 'Hey there! I joined the squad 🚀',
    isOnline: true,
    lastSeen: 'Online',
    joinedAt: new Date().toISOString().split('T')[0],
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  setActiveUserId(newUser.id);

  // Automatically add welcome message to Squad HQ group chat!
  const messages = getStoredMessages();
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const welcomeMessage: ChatMessage = {
    id: 'msg_welcome_' + Date.now(),
    chatId: 'group-squad',
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '',
    text: `✨ ${displayName} has joined the squad! They are automatically added to this group.`,
    timestamp: timeFormatted,
    isoDate: now.toISOString(),
    status: 'read',
    isSystem: true,
  };
  saveMessages([...messages, welcomeMessage]);

  logActivity(newUser.id, newUser.name, 'Joined the Squad', 'Created account with password and auto-joined Group Chat');

  return { success: true, user: newUser };
}

// Subscribe to storage changes
export function subscribeToSync(callback: (type: string, data?: any) => void): () => void {
  const handler = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data.type, e.data.payload);
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === USERS_STORAGE_KEY) callback('USERS_UPDATED');
    if (e.key === MESSAGES_STORAGE_KEY) callback('MESSAGES_UPDATED');
    if (e.key === MEDIA_STORAGE_KEY) callback('MEDIA_UPDATED');
    if (e.key === NOTICES_STORAGE_KEY) callback('NOTICES_UPDATED');
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handler);
  }
  window.addEventListener('storage', storageHandler);

  return () => {
    if (syncChannel) syncChannel.removeEventListener('message', handler);
    window.removeEventListener('storage', storageHandler);
  };
}
