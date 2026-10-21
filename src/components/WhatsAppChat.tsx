import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video as VideoIcon,
  Search,
  MoreVertical,
  X,
  Users,
  Image,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { ChatMessage, User } from '../types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { EmojiPicker } from './EmojiPicker';
import { MediaAttachmentModal } from './MediaAttachmentModal';

interface WhatsAppChatProps {
  chatId: string;
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
  onSendMessage: (params: {
    chatId: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
    replyTo?: ChatMessage['replyTo'];
  }) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onOpenAlbum: () => void;
  onBackToSidebar?: () => void;
  onOpenMediaLightbox: (url: string, title?: string) => void;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  chatId,
  currentUser,
  users,
  messages,
  onSendMessage,
  onDeleteMessage,
  onReactMessage,
  onOpenAlbum,
  onBackToSidebar,
  onOpenMediaLightbox,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [callNotification, setCallNotification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isGroup = chatId === 'group-squad';

  // Find recipient if 1-on-1
  let otherFriend: User | undefined;
  if (!isGroup) {
    const friendId = chatId.split('_').find((id) => id !== currentUser.id);
    otherFriend = users.find((u) => u.id === friendId) || users.find((u) => chatId.includes(u.id));
  }

  // Filter messages for current chat
  const chatMessages = messages.filter((m) => {
    if (isGroup) return m.chatId === 'group-squad';
    if (!otherFriend) return false;
    const sortedKey = [currentUser.id, otherFriend.id].sort().join('_');
    return (
      m.chatId === sortedKey ||
      m.chatId === `dm_${otherFriend.id}` ||
      (m.senderId === otherFriend.id && m.chatId === `dm_${currentUser.id}`)
    );
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (currentUser.isMuted) {
      alert('You are currently muted by the squad admin and cannot send messages.');
      return;
    }

    onSendMessage({
      chatId: isGroup ? 'group-squad' : otherFriend ? [currentUser.id, otherFriend.id].sort().join('_') : chatId,
      text: inputText.trim(),
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text || 'Media attachment',
          }
        : undefined,
    });

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleSendMedia = (params: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
  }) => {
    if (currentUser.isMuted) {
      alert('You are muted by the admin.');
      return;
    }
    onSendMessage({
      chatId: isGroup ? 'group-squad' : otherFriend ? [currentUser.id, otherFriend.id].sort().join('_') : chatId,
      text: params.caption || '',
      mediaUrl: params.mediaUrl,
      mediaType: params.mediaType,
    });
  };

  const handleSendVoiceNote = () => {
    if (currentUser.isMuted) return;
    onSendMessage({
      chatId: isGroup ? 'group-squad' : otherFriend ? [currentUser.id, otherFriend.id].sort().join('_') : chatId,
      text: 'Voice note (0:28)',
      mediaType: 'audio',
      mediaUrl: '#audio',
    });
  };

  const triggerCallSimulation = (type: 'Audio' | 'Video') => {
    const targetName = isGroup ? 'Squad HQ' : otherFriend?.name || 'Friend';
    setCallNotification(`Calling ${targetName} (${type} Call)... 📞 Connected!`);
    setTimeout(() => {
      setCallNotification(null);
    }, 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* WhatsApp Chat Header */}
      <div className="bg-[#f0f2f5] border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackToSidebar && (
            <button
              onClick={onBackToSidebar}
              className="p-1 sm:hidden text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {isGroup ? (
            <div
              onClick={() => setShowGroupInfo(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-800 truncate">Squad HQ 🚀</h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {users.map((u) => u.name.split(' ')[0]).join(', ')}
                </p>
              </div>
            </div>
          ) : otherFriend ? (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={otherFriend.avatar}
                  alt={otherFriend.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                {otherFriend.isOnline && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{otherFriend.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {otherFriend.isOnline ? (
                    <span className="text-emerald-600 font-semibold">Online</span>
                  ) : (
                    `last seen ${otherFriend.lastSeen}`
                  )}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2 text-slate-600">
          <button
            onClick={() => triggerCallSimulation('Video')}
            className="p-2 hover:bg-slate-200/80 rounded-full transition-colors"
            title="Video Call"
          >
            <VideoIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerCallSimulation('Audio')}
            className="p-2 hover:bg-slate-200/80 rounded-full transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAlbum}
            className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
            title="Open Shared Photo Album"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Photo Album</span>
          </button>
        </div>
      </div>

      {/* Simulated Call Notification */}
      {callNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-900 text-white px-4 py-2 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Phone className="w-3.5 h-3.5 text-emerald-300" />
          <span>{callNotification}</span>
        </div>
      )}

      {/* Chat Messages List (WhatsApp wallpaper) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 wa-chat-bg space-y-1">
        {/* Chat Security banner */}
        <div className="flex justify-center my-2">
          <div className="bg-[#ffeecd] border border-amber-200/60 text-amber-900 text-[11px] px-3 py-1 rounded-lg shadow-2xs max-w-sm text-center">
            🔒 Private 8 Friends Squad. All messages and photo uploads are synchronized in real-time.
          </div>
        </div>

        {chatMessages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            currentUser={currentUser}
            isGroup={isGroup}
            onReact={onReactMessage}
            onReply={(m) => setReplyingTo(m)}
            onDelete={onDeleteMessage}
            onOpenMediaLightbox={onOpenMediaLightbox}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Quote Banner */}
      {replyingTo && (
        <div className="bg-slate-100 border-t border-slate-200 p-2 px-4 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="border-l-4 border-emerald-600 pl-2">
            <span className="font-bold text-emerald-800 text-[11px]">
              Replying to {replyingTo.senderName}
            </span>
            <p className="text-slate-600 line-clamp-1 text-[11px]">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Muted Warning */}
      {currentUser.isMuted && (
        <div className="bg-amber-100 border-t border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          ⚠️ You have been muted by Admin Parvin. You can view messages and photos, but cannot send new messages.
        </div>
      )}

      {/* Chat Input Footer */}
      <div className="bg-[#f0f2f5] border-t border-slate-200 p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelectEmoji={(emoji) => {
              setInputText((prev) => prev + emoji);
              inputRef.current?.focus();
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Attachment menu (Photos, Videos) */}
        <button
          type="button"
          onClick={() => setShowAttachmentModal(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
          title="Attach Photo or Video"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Main message text input */}
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            disabled={currentUser.isMuted}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentUser.isMuted ? 'Muted by admin...' : 'Type a WhatsApp message...'
            }
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
          />

          {inputText.trim() ? (
            <button
              type="submit"
              disabled={currentUser.isMuted}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full transition-transform shadow-xs flex items-center justify-center shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendVoiceNote}
              disabled={currentUser.isMuted}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full transition-transform shadow-xs flex items-center justify-center shrink-0"
              title="Record / Send Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <MediaAttachmentModal
          onClose={() => setShowAttachmentModal(false)}
          onSendMedia={handleSendMedia}
        />
      )}

      {/* Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Squad HQ Group Info</h3>
                <p className="text-xs text-emerald-200">{users.length} Friends in Group</p>
              </div>
              <button onClick={() => setShowGroupInfo(false)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100">
              <p className="text-xs text-slate-500 mb-2">
                All 8 friends are members. Anyone who creates a new password login is automatically added here!
              </p>
              {users.map((u) => (
                <div key={u.id} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-xs text-slate-800">{u.name}</span>
                      <p className="text-[10px] text-slate-400">{u.statusText}</p>
                    </div>
                  </div>
                  {u.role === 'admin' ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Group Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Member</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
