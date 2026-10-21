import React, { useState } from 'react';
import { X, Download, Heart, MessageCircle, ChevronLeft, ChevronRight, User as UserIcon, Trash2, Calendar, Share2, Check } from 'lucide-react';
import { SharedMedia, User } from '../types';

interface PhotoLightboxProps {
  media: SharedMedia | null;
  currentUser: User;
  onClose: () => void;
  onLike: (mediaId: string) => void;
  onComment: (mediaId: string, text: string) => void;
  onDeleteMedia?: (mediaId: string) => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  media,
  currentUser,
  onClose,
  onLike,
  onComment,
  onDeleteMedia,
  onNavigate,
  hasPrev,
  hasNext,
}) => {
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!media) return null;

  const isLiked = media.likes.includes(currentUser.id);
  const isAdmin = currentUser.role === 'admin';
  const canDelete = isAdmin || media.uploaderId === currentUser.id;

  const handleDownload = () => {
    const filename = `${media.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'photo'}-${Date.now()}.${
      media.type === 'video' ? 'mp4' : 'jpg'
    }`;

    // Create virtual anchor and trigger download
    const anchor = document.createElement('a');
    anchor.href = media.url;
    anchor.download = filename;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(media.id, commentText.trim());
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(media.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev / Next buttons */}
      {hasPrev && onNavigate && (
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-60 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-transform active:scale-95"
          title="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && onNavigate && (
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-60 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-transform active:scale-95"
          title="Next Photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-6xl w-full h-[90vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
        {/* Media Preview (Left/Top) */}
        <div className="flex-1 bg-black flex items-center justify-center relative p-2 overflow-hidden select-none">
          {media.type === 'video' ? (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img
              src={media.url}
              alt={media.title}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          )}

          {/* Album Badge */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
            📁 {media.album}
          </div>
        </div>

        {/* Sidebar Info & Comments (Right/Bottom) */}
        <div className="w-full md:w-96 bg-slate-900 text-slate-100 flex flex-col border-t md:border-t-0 md:border-l border-white/10 h-64 md:h-full">
          {/* Uploader Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={media.uploaderAvatar}
                alt={media.uploaderName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{media.uploaderName}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{media.timestamp}</span>
                </div>
              </div>
            </div>

            {canDelete && onDeleteMedia && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this media from the squad album?')) {
                    onDeleteMedia(media.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                title={isAdmin ? 'Admin: Delete photo' : 'Delete photo'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Title & Caption */}
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-base text-white">{media.title}</h3>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {/* PRIMARY DOWNLOAD BUTTON */}
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
                title="Download original high resolution photo to your device"
              >
                <Download className="w-4 h-4" />
                <span>Download Photo</span>
              </button>

              <button
                onClick={() => onLike(media.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLiked
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{media.likes.length}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                title="Copy Photo Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Squad Comments ({media.comments.length})</span>
            </div>

            {media.comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No comments yet. Be the first friend to leave some love! ❤️
              </p>
            ) : (
              media.comments.map((comm) => (
                <div key={comm.id} className="flex gap-2.5 text-xs">
                  <img
                    src={comm.userAvatar}
                    alt={comm.userName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between font-semibold text-emerald-400 text-[11px] mb-0.5">
                      <span>{comm.userName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{comm.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{comm.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleSendComment} className="p-3 border-t border-white/10 bg-slate-950/50 flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
