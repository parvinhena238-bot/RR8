import React, { useState } from 'react';
import { Check, CheckCheck, Download, Trash2, Reply, Smile, Play, Pause, ExternalLink } from 'lucide-react';
import { ChatMessage, User } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  currentUser: User;
  isGroup: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onOpenMediaLightbox?: (url: string, title?: string) => void;
}

const SENDER_COLORS: Record<string, string> = {
  user_parvin: 'text-amber-700',
  user_alex: 'text-sky-600',
  user_sam: 'text-emerald-700',
  user_priya: 'text-fuchsia-600',
  user_jordan: 'text-indigo-600',
  user_maya: 'text-pink-600',
  user_leo: 'text-orange-600',
  user_elena: 'text-teal-600',
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  currentUser,
  isGroup,
  onReact,
  onReply,
  onDelete,
  onOpenMediaLightbox,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  const isMe = message.senderId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const canDelete = isMe || isAdmin;

  // System Messages (e.g. Someone joined)
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-amber-100/90 border border-amber-200/80 text-amber-900 text-[11px] font-medium px-3.5 py-1 rounded-full shadow-2xs max-w-md text-center">
          {message.text}
        </div>
      </div>
    );
  }

  const senderColor = SENDER_COLORS[message.senderId] || 'text-emerald-700';

  const downloadFile = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'friendsquad-media.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`group relative flex flex-col my-1 ${
        isMe ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2 shadow-xs transition-shadow hover:shadow-md ${
          isMe
            ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-xs border border-emerald-200/50'
            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/60'
        }`}
      >
        {/* Reply Quote Banner if any */}
        {message.replyTo && (
          <div className="mb-2 p-1.5 pl-2.5 rounded-lg bg-black/5 border-l-4 border-emerald-600 text-xs">
            <span className="font-bold text-emerald-800 block text-[11px]">
              {message.replyTo.senderName}
            </span>
            <span className="text-slate-600 line-clamp-1 text-[11px]">
              {message.replyTo.text}
            </span>
          </div>
        )}

        {/* Group Sender Name & Avatar */}
        {!isMe && isGroup && (
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
            />
            <span className={`text-[11px] font-bold ${senderColor}`}>
              {message.senderName}
            </span>
            {message.senderId === 'user_parvin' && (
              <span className="text-[9px] bg-amber-200 text-amber-800 font-bold px-1 rounded-sm">
                Admin
              </span>
            )}
          </div>
        )}

        {/* Media Content (Image or Video) */}
        {message.mediaUrl && (
          <div className="my-1.5 rounded-xl overflow-hidden relative group/media bg-slate-900/5">
            {message.mediaType === 'video' ? (
              <video
                src={message.mediaUrl}
                controls
                className="max-h-64 w-full rounded-xl object-contain bg-black"
              />
            ) : (
              <div
                className="cursor-pointer relative overflow-hidden"
                onClick={() => onOpenMediaLightbox?.(message.mediaUrl!, message.text)}
              >
                <img
                  src={message.mediaUrl}
                  alt="Chat attachment"
                  className="max-h-64 w-full object-cover rounded-xl hover:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <span className="text-[10px] text-white font-medium flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
                    <ExternalLink className="w-3 h-3" /> View Full
                  </span>
                  <button
                    onClick={(e) => downloadFile(e, message.mediaUrl!, `chat-photo-${message.id}.jpg`)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md transition-transform active:scale-95"
                    title="Download Photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Message Simulation */}
        {message.mediaType === 'audio' && (
          <div className="flex items-center gap-2.5 my-1.5 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs hover:bg-emerald-700"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-0.5 h-6">
                {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 30, 75, 40, 60].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{isPlayingAudio ? '0:14' : '0:00'}</span>
                <span>0:28</span>
              </div>
            </div>
          </div>
        )}

        {/* Text Content */}
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-12 font-normal">
            {message.text}
          </p>
        )}

        {/* Footer: Time + WhatsApp Read Receipt Ticks */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-0.5 select-none float-right -mt-2.5">
          <span>{message.timestamp}</span>
          {isMe && (
            <span className="text-sky-500 font-bold ml-0.5" title="Read by squad">
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
              ) : (
                <Check className="w-3.5 h-3.5 text-slate-400 inline" />
              )}
            </span>
          )}
        </div>

        {/* Message Reactions Badges */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 -mb-1">
            {Object.entries(message.reactions).map(([emoji, userIds]) => {
              if (!userIds || userIds.length === 0) return null;
              const hasReacted = userIds.includes(currentUser.id);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border shadow-2xs transition-transform active:scale-110 ${
                    hasReacted
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white/80 border-slate-200 text-slate-700'
                  }`}
                  title={`${userIds.length} friend(s) reacted with ${emoji}`}
                >
                  <span>{emoji}</span>
                  {userIds.length > 1 && <span>{userIds.length}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover Action Bar (WhatsApp style quick reaction & menu) */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 ${
          isMe ? 'right-2' : 'left-2'
        } flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-full px-2 py-0.5 z-20`}
      >
        <button
          onClick={() => setShowQuickReactions(!showQuickReactions)}
          className="p-1 hover:text-amber-500 text-slate-400 rounded-full"
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onReply(message)}
          className="p-1 hover:text-emerald-600 text-slate-400 rounded-full"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        {message.mediaUrl && (
          <button
            onClick={(e) => downloadFile(e, message.mediaUrl!, `friendsquad-${message.id}.jpg`)}
            className="p-1 hover:text-sky-600 text-slate-400 rounded-full"
            title="Download Media"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 hover:text-rose-600 text-slate-400 rounded-full"
            title={isAdmin && !isMe ? 'Admin: Delete message' : 'Delete message'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Reactions Floater */}
      {showQuickReactions && (
        <div
          className={`absolute -top-10 ${
            isMe ? 'right-2' : 'left-2'
          } z-30 flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-full px-2 py-1 animate-in zoom-in-90`}
        >
          {['❤️', '😂', '🔥', '👍', '😮', '🎉'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji);
                setShowQuickReactions(false);
              }}
              className="text-base hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
