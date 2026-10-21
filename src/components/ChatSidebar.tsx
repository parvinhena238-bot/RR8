import React, { useState } from 'react';
import {
  Users,
  Search,
  Pin,
  CheckCheck,
  Check,
  Shield,
  Circle,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatSidebarProps {
  currentUser: User;
  users: User[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  messages: ChatMessage[];
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenAlbum: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentUser,
  users,
  activeChatId,
  onSelectChat,
  messages,
  onOpenProfile,
  onOpenAdmin,
  onOpenAlbum,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group chat latest message
  const groupMessages = messages.filter((m) => m.chatId === 'group-squad');
  const latestGroupMsg = groupMessages[groupMessages.length - 1];

  // Friends excluding current user
  const otherFriends = users.filter((u) => u.id !== currentUser.id);

  // Search filter
  const filteredFriends = otherFriends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.statusText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get last message for individual chat
  const getDmLastMessage = (friendId: string) => {
    const dmMessages = messages.filter(
      (m) =>
        (m.chatId === `dm_${friendId}` && (m.senderId === currentUser.id || m.senderId === friendId)) ||
        (m.chatId === `dm_${currentUser.id}` && (m.senderId === currentUser.id || m.senderId === friendId)) ||
        // Support bidirectional dm key
        (m.chatId === [currentUser.id, friendId].sort().join('_'))
    );
    return dmMessages[dmMessages.length - 1];
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="w-full sm:w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col h-full select-none shrink-0">
      {/* WhatsApp Green App Bar */}
      <div className="bg-emerald-800 text-white p-3.5 flex items-center justify-between border-b border-emerald-900 shadow-xs">
        {/* User Profile Pill */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-emerald-700/60 transition-colors"
          title="Click to change your profile photo or status"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
            />
            <span className="w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full absolute bottom-0 right-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight truncate max-w-[120px] sm:max-w-[140px]">
                {currentUser.name}
              </span>
              {isAdmin && (
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black uppercase px-1 rounded-sm shadow-2xs">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200 line-clamp-1 max-w-[130px]">
              {currentUser.statusText}
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2 bg-amber-400/20 hover:bg-amber-400/40 text-amber-300 rounded-xl transition-all"
              title="Admin Activity Control Center"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="p-2 hover:bg-emerald-700/60 text-emerald-100 rounded-xl transition-colors"
            title="Edit Profile Photo & Bio"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends or chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* Pinned Group Chat: Squad HQ */}
        <div
          onClick={() => onSelectChat('group-squad')}
          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
            activeChatId === 'group-squad'
              ? 'bg-emerald-50/90 border-r-4 border-emerald-600'
              : 'hover:bg-slate-50'
          }`}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              <Users className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow-2xs" title="Pinned Main Squad Group">
              <Pin className="w-3 h-3 fill-slate-900" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm text-slate-800 truncate">Squad HQ 🚀</span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full shrink-0">
                  {users.length} Friends
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {latestGroupMsg?.timestamp || '9:00 AM'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <p className="truncate text-xs">
                {latestGroupMsg ? (
                  <span>
                    <strong className="text-slate-700 font-medium">
                      {latestGroupMsg.senderId === currentUser.id ? 'You' : latestGroupMsg.senderName.split(' ')[0]}:
                    </strong>{' '}
                    {latestGroupMsg.mediaUrl ? (latestGroupMsg.mediaType === 'video' ? '🎥 Video' : '📷 Photo') : latestGroupMsg.text}
                  </span>
                ) : (
                  'Start chatting with the squad...'
                )}
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Section Header: Individual Friends */}
        <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Individual Chats ({filteredFriends.length})</span>
          <span>Online ({users.filter((u) => u.isOnline).length})</span>
        </div>

        {/* Individual Chats List */}
        {filteredFriends.map((friend) => {
          const dmChatId = [currentUser.id, friend.id].sort().join('_');
          const isSelected = activeChatId === dmChatId;
          const lastMsg = getDmLastMessage(friend.id);

          return (
            <div
              key={friend.id}
              onClick={() => onSelectChat(dmChatId)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
                isSelected
                  ? 'bg-emerald-50/90 border-r-4 border-emerald-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                />
                {friend.isOnline ? (
                  <span
                    className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0 shadow-2xs"
                    title="Online"
                  />
                ) : (
                  <span
                    className="w-3 h-3 bg-slate-300 border-2 border-white rounded-full absolute bottom-0 right-0"
                    title="Offline"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-sm text-slate-800 truncate">
                      {friend.name}
                    </span>
                    {friend.role === 'admin' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded-sm shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {lastMsg ? lastMsg.timestamp : friend.isOnline ? 'Online' : friend.lastSeen}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                  <p className="truncate text-xs">
                    {lastMsg ? (
                      lastMsg.mediaUrl ? (
                        lastMsg.mediaType === 'video' ? '🎥 Video' : '📷 Photo'
                      ) : (
                        lastMsg.text
                      )
                    ) : (
                      <span className="text-slate-400 italic">{friend.statusText}</span>
                    )}
                  </p>
                  {friend.isMuted && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded-sm shrink-0">
                      Muted
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFriends.length === 0 && (
          <div className="p-6 text-center text-slate-400">
            <p className="text-xs font-semibold text-slate-600 mb-1">No other friends yet</p>
            <p className="text-[11px] text-slate-400">
              When friends join with their password, they will automatically appear here and in Squad HQ!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Switcher / Status Banner */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">
          🔑 Logged in with password
        </span>
        <button
          onClick={onOpenAlbum}
          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-xs"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Shared Album</span>
        </button>
      </div>
    </div>
  );
};
