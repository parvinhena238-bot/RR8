/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  ChatMessage,
  SharedMedia,
  Notice,
  ActivityLog,
} from './types';
import {
  getStoredUsers,
  saveUsers,
  getStoredMessages,
  saveMessages,
  getStoredMedia,
  saveMedia,
  getStoredNotices,
  saveNotices,
  getStoredActivity,
  logActivity,
  getActiveUserId,
  setActiveUserId,
  loginWithPassword,
  registerWithPasswordOnly,
  subscribeToSync,
  INITIAL_USERS,
} from './services/storage';

import { TopNavbar } from './components/TopNavbar';
import { NoticeBar } from './components/NoticeBar';
import { ChatSidebar } from './components/ChatSidebar';
import { WhatsAppChat } from './components/WhatsAppChat';
import { SharedAlbum } from './components/SharedAlbum';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/AdminPanel';
import { PhotoLightbox } from './components/PhotoLightbox';

export default function App() {
  // Core states
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessages());
  const [mediaList, setMediaList] = useState<SharedMedia[]>(() => getStoredMedia());
  const [notices, setNotices] = useState<Notice[]>(() => getStoredNotices());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getStoredActivity());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getActiveUserId());

  // UI Navigation states
  const [currentTab, setCurrentTab] = useState<'chat' | 'album'>('chat');
  const [activeChatId, setActiveChatId] = useState<string>('group-squad');
  const [mobileChatView, setMobileChatView] = useState<boolean>(false);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<SharedMedia | null>(null);

  // Synchronize across browser tabs & storage
  useEffect(() => {
    const unsubscribe = subscribeToSync((type) => {
      setUsers(getStoredUsers());
      setMessages(getStoredMessages());
      setMediaList(getStoredMedia());
      setNotices(getStoredNotices());
      setActivityLogs(getStoredActivity());
    });
    return () => unsubscribe();
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Handle Login with Password Only
  const handleLogin = (password: string) => {
    const res = loginWithPassword(password);
    if (res.success && res.user) {
      setCurrentUserId(res.user.id);
      setUsers(getStoredUsers());
      setActivityLogs(getStoredActivity());
    }
    return res;
  };

  // Handle Register with Password Only
  const handleRegister = (data: {
    password: string;
    name?: string;
    avatar?: string;
    statusText?: string;
  }) => {
    const res = registerWithPasswordOnly(data);
    if (res.success && res.user) {
      setCurrentUserId(res.user.id);
      setUsers(getStoredUsers());
      setMessages(getStoredMessages());
      setActivityLogs(getStoredActivity());
      setActiveChatId('group-squad');
    }
    return res;
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, 'Signed Out', 'User locked / signed out');
    }
    setActiveUserId(null);
    setCurrentUserId(null);
  };

  // Chat message sending (supports text, photos, and videos)
  const handleSendMessage = (params: {
    chatId: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
    replyTo?: ChatMessage['replyTo'];
  }) => {
    if (!currentUser) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 6),
      chatId: params.chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: params.text,
      mediaUrl: params.mediaUrl,
      mediaType: params.mediaType,
      timestamp: timeFormatted,
      isoDate: now.toISOString(),
      status: 'read',
      reactions: {},
      replyTo: params.replyTo,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(updated);

    // If a photo or video was attached in the chat, automatically sync to the Shared Album
    if (params.mediaUrl && (params.mediaType === 'image' || params.mediaType === 'video')) {
      const albumTitle = params.text || (params.mediaType === 'image' ? 'Shared in Chat' : 'Chat Video');
      const newAlbumMedia: SharedMedia = {
        id: 'media_chat_' + Date.now(),
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        uploaderAvatar: currentUser.avatar,
        type: params.mediaType,
        url: params.mediaUrl,
        title: albumTitle,
        album: params.chatId === 'group-squad' ? 'Trips & Vacations' : 'Weekend Hangouts',
        timestamp: `${now.toLocaleDateString()} ${timeFormatted}`,
        likes: [],
        comments: [],
      };
      const updatedMedia = [newAlbumMedia, ...mediaList];
      setMediaList(updatedMedia);
      saveMedia(updatedMedia);
    }

    logActivity(
      currentUser.id,
      currentUser.name,
      params.mediaUrl ? 'Shared Media in Chat' : 'Sent Message',
      params.chatId === 'group-squad' ? 'Message in Squad HQ' : 'Direct Message'
    );
  };

  // Delete message (Admin can delete anyone's; users can delete their own)
  const handleDeleteMessage = (messageId: string) => {
    if (!currentUser) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;

    if (currentUser.role !== 'admin' && target.senderId !== currentUser.id) {
      alert('Only the sender or Admin Parvin can delete this message.');
      return;
    }

    const updated = messages.filter((m) => m.id !== messageId);
    setMessages(updated);
    saveMessages(updated);

    logActivity(
      currentUser.id,
      currentUser.name,
      'Deleted Message',
      `Removed message "${target.text || 'media'}"`
    );
  };

  // Message Reactions (WhatsApp emojis)
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!currentUser) return;

    const updated = messages.map((m) => {
      if (m.id !== messageId) return m;

      const currentReactions = { ...(m.reactions || {}) };
      const currentUsersForEmoji = currentReactions[emoji] || [];

      if (currentUsersForEmoji.includes(currentUser.id)) {
        // Toggle off
        currentReactions[emoji] = currentUsersForEmoji.filter((id) => id !== currentUser.id);
        if (currentReactions[emoji].length === 0) {
          delete currentReactions[emoji];
        }
      } else {
        // Toggle on
        currentReactions[emoji] = [...currentUsersForEmoji, currentUser.id];
      }

      return {
        ...m,
        reactions: currentReactions,
      };
    });

    setMessages(updated);
    saveMessages(updated);
  };

  // Shared Album Upload
  const handleUploadAlbumMedia = (
    media: Omit<SharedMedia, 'id' | 'timestamp' | 'likes' | 'comments'>
  ) => {
    if (!currentUser) return;

    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newMediaItem: SharedMedia = {
      ...media,
      id: 'media_' + Date.now(),
      timestamp: timeFormatted,
      likes: [],
      comments: [],
    };

    const updated = [newMediaItem, ...mediaList];
    setMediaList(updated);
    saveMedia(updated);

    // Also notify the Squad HQ chat so everyone knows a photo was posted!
    const squadMsg: ChatMessage = {
      id: 'msg_album_sync_' + Date.now(),
      chatId: 'group-squad',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `📸 Added "${newMediaItem.title}" to the Shared Photo Album! Everyone can download it now.`,
      mediaUrl: newMediaItem.url,
      mediaType: newMediaItem.type,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoDate: now.toISOString(),
      status: 'read',
    };
    const updatedMessages = [...messages, squadMsg];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    logActivity(
      currentUser.id,
      currentUser.name,
      'Uploaded to Shared Album',
      `Uploaded "${newMediaItem.title}" (${newMediaItem.album})`
    );
  };

  // Like media in album
  const handleLikeMedia = (mediaId: string) => {
    if (!currentUser) return;
    const updated = mediaList.map((item) => {
      if (item.id !== mediaId) return item;
      const isLiked = item.likes.includes(currentUser.id);
      return {
        ...item,
        likes: isLiked
          ? item.likes.filter((id) => id !== currentUser.id)
          : [...item.likes, currentUser.id],
      };
    });
    setMediaList(updated);
    saveMedia(updated);
  };

  // Comment on media
  const handleCommentMedia = (mediaId: string, text: string) => {
    if (!currentUser) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = mediaList.map((item) => {
      if (item.id !== mediaId) return item;
      return {
        ...item,
        comments: [
          ...item.comments,
          {
            id: 'comm_' + Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text,
            timestamp: timeFormatted,
          },
        ],
      };
    });
    setMediaList(updated);
    saveMedia(updated);
  };

  // Delete media from album (Admin or uploader)
  const handleDeleteMedia = (mediaId: string) => {
    const updated = mediaList.filter((m) => m.id !== mediaId);
    setMediaList(updated);
    saveMedia(updated);
    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, 'Deleted Photo/Video', `Removed media ${mediaId}`);
    }
  };

  // Notice Bar updates
  const handleAddOrUpdateNotice = (notice: Notice) => {
    const exists = notices.find((n) => n.id === notice.id);
    let updated: Notice[];
    if (exists) {
      updated = notices.map((n) => (n.id === notice.id ? notice : n));
    } else {
      updated = [notice, ...notices];
    }
    setNotices(updated);
    saveNotices(updated);

    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, 'Updated Notice', notice.title);
    }
  };

  const handleDeleteNotice = (noticeId: string) => {
    const updated = notices.filter((n) => n.id !== noticeId);
    setNotices(updated);
    saveNotices(updated);
  };

  // Profile update (change photo, name, status, password)
  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, ...updatedData };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    // If name or avatar changed, also update messages
    if (updatedData.name || updatedData.avatar) {
      const updatedMessages = messages.map((m) => {
        if (m.senderId === currentUser.id) {
          return {
            ...m,
            senderName: updatedData.name || m.senderName,
            senderAvatar: updatedData.avatar || m.senderAvatar,
          };
        }
        return m;
      });
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    }

    logActivity(
      currentUser.id,
      currentUser.name,
      'Updated Profile',
      'Changed profile picture or personal details'
    );
  };

  // Admin updates any friend
  const handleAdminUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        'Admin Modified User',
        `Changed settings/permissions for user ${userId}`
      );
    }
  };

  // Admin adds new user directly
  const handleAdminAddUser = (data: { password: string; name: string; avatar: string }) => {
    handleRegister({
      password: data.password,
      name: data.name,
      avatar: data.avatar,
    });
  };

  // Open direct lightbox from chat photo
  const handleOpenMediaLightboxFromChat = (url: string, title?: string) => {
    const matchedMedia = mediaList.find((m) => m.url === url);
    if (matchedMedia) {
      setLightboxMedia(matchedMedia);
    } else {
      // Create ad-hoc viewable media item
      setLightboxMedia({
        id: 'adhoc_' + Date.now(),
        uploaderId: 'chat',
        uploaderName: 'Chat Shared Media',
        uploaderAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        type: url.includes('.mp4') ? 'video' : 'image',
        url,
        title: title || 'Full Resolution Media',
        album: 'Chat Gallery',
        timestamp: 'Just now',
        likes: [],
        comments: [],
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* 1. Login Modal if not signed in */}
      {!currentUser && (
        <LoginModal users={users} onLogin={handleLogin} onRegister={handleRegister} />
      )}

      {/* Main App Layout */}
      {currentUser && (
        <>
          {/* Top Navbar */}
          <TopNavbar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            currentUser={currentUser}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onLogout={handleLogout}
            onSwitchUserPrompt={() => setCurrentUserId(null)}
          />

          {/* Top Notice Bar */}
          <NoticeBar
            notices={notices}
            currentUser={currentUser}
            onAddOrUpdateNotice={handleAddOrUpdateNotice}
            onDeleteNotice={handleDeleteNotice}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex overflow-hidden">
            {currentTab === 'chat' ? (
              <div className="flex-1 flex w-full h-full overflow-hidden">
                {/* Left Sidebar (WhatsApp style contact & group list) */}
                <div
                  className={`${
                    mobileChatView ? 'hidden sm:flex' : 'flex'
                  } w-full sm:w-80 md:w-96 h-full`}
                >
                  <ChatSidebar
                    currentUser={currentUser}
                    users={users}
                    activeChatId={activeChatId}
                    onSelectChat={(id) => {
                      setActiveChatId(id);
                      setMobileChatView(true);
                    }}
                    messages={messages}
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onOpenAdmin={() => setIsAdminOpen(true)}
                    onOpenAlbum={() => setCurrentTab('album')}
                  />
                </div>

                {/* Right Chat Window */}
                <div
                  className={`${
                    !mobileChatView ? 'hidden sm:flex' : 'flex'
                  } flex-1 h-full`}
                >
                  <WhatsAppChat
                    chatId={activeChatId}
                    currentUser={currentUser}
                    users={users}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReactMessage={handleReactMessage}
                    onOpenAlbum={() => setCurrentTab('album')}
                    onBackToSidebar={() => setMobileChatView(false)}
                    onOpenMediaLightbox={handleOpenMediaLightboxFromChat}
                  />
                </div>
              </div>
            ) : (
              /* Photo Album Tab */
              <SharedAlbum
                mediaList={mediaList}
                currentUser={currentUser}
                users={users}
                onUploadMedia={handleUploadAlbumMedia}
                onLikeMedia={handleLikeMedia}
                onCommentMedia={handleCommentMedia}
                onDeleteMedia={handleDeleteMedia}
              />
            )}
          </main>

          {/* Profile Modal */}
          {isProfileOpen && (
            <ProfileModal
              currentUser={currentUser}
              onClose={() => setIsProfileOpen(false)}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {/* Admin Control Center Modal */}
          {isAdminOpen && (
            <AdminPanel
              currentUser={currentUser}
              users={users}
              activityLogs={activityLogs}
              mediaList={mediaList}
              onClose={() => setIsAdminOpen(false)}
              onUpdateUser={handleAdminUpdateUser}
              onDeleteMedia={handleDeleteMedia}
              onAddUser={handleAdminAddUser}
            />
          )}

          {/* Lightbox for full-res downloads */}
          {lightboxMedia && (
            <PhotoLightbox
              media={lightboxMedia}
              currentUser={currentUser}
              onClose={() => setLightboxMedia(null)}
              onLike={handleLikeMedia}
              onComment={handleCommentMedia}
              onDeleteMedia={handleDeleteMedia}
            />
          )}
        </>
      )}
    </div>
  );
}
