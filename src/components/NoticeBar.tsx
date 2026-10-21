import React, { useState } from 'react';
import { Megaphone, Pin, AlertCircle, Plus, ChevronRight, X, Clock, Edit2 } from 'lucide-react';
import { Notice, User } from '../types';

interface NoticeBarProps {
  notices: Notice[];
  currentUser: User | null;
  onAddOrUpdateNotice: (notice: Notice) => void;
  onDeleteNotice: (noticeId: string) => void;
}

export const NoticeBar: React.FC<NoticeBarProps> = ({
  notices,
  currentUser,
  onAddOrUpdateNotice,
  onDeleteNotice,
}) => {
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotice, setEditNotice] = useState<Partial<Notice>>({
    title: '',
    content: '',
    priority: 'normal',
    pinned: true,
  });

  const activeNotices = notices.filter((n) => n.isActive);
  const pinnedNotice = activeNotices.find((n) => n.pinned) || activeNotices[0];

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNotice.title?.trim() || !editNotice.content?.trim()) return;

    const noticeToSave: Notice = {
      id: editNotice.id || 'notice_' + Date.now(),
      title: editNotice.title.trim(),
      content: editNotice.content.trim(),
      priority: editNotice.priority || 'normal',
      pinned: editNotice.pinned ?? true,
      isActive: true,
      createdAt: editNotice.createdAt || new Date().toISOString(),
      createdBy: currentUser?.id || 'admin',
      authorName: currentUser?.name || 'Admin',
    };

    onAddOrUpdateNotice(noticeToSave);
    setIsEditing(false);
    setEditNotice({ title: '', content: '', priority: 'normal', pinned: true });
  };

  const startEdit = (notice?: Notice) => {
    if (notice) {
      setEditNotice(notice);
    } else {
      setEditNotice({
        title: '',
        content: '',
        priority: 'normal',
        pinned: true,
      });
    }
    setIsEditing(true);
  };

  if (!pinnedNotice && !isAdmin) {
    return null;
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-amber-500 text-white border-amber-600 animate-pulse';
      case 'important':
        return 'bg-emerald-600 text-white border-emerald-700';
      default:
        return 'bg-teal-700 text-white border-teal-800';
    }
  };

  return (
    <>
      {/* Sticky Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md border-b border-emerald-700/50 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs bg-emerald-600/90 text-emerald-100 ring-1 ring-white/20 whitespace-nowrap shrink-0">
              <Megaphone className="w-3.5 h-3.5 text-amber-300" />
              Notice
            </span>

            {pinnedNotice ? (
              <div
                onClick={() => setShowAllNotices(true)}
                className="flex items-center gap-2 cursor-pointer hover:text-emerald-200 transition-colors truncate"
              >
                <span className="font-semibold text-emerald-100 shrink-0">
                  {pinnedNotice.title}
                </span>
                <span className="text-white/80 truncate hidden md:inline">
                  — {pinnedNotice.content}
                </span>
              </div>
            ) : (
              <span className="text-emerald-200/80 italic">No active notices right now</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeNotices.length > 0 && (
              <button
                onClick={() => setShowAllNotices(true)}
                className="flex items-center gap-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors"
                title="View all announcements"
              >
                <span>All ({activeNotices.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => startEdit()}
                className="flex items-center gap-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-2.5 py-1 rounded-md transition-transform active:scale-95 shadow-xs"
                title="Admin: Post or edit notice"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Notice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View All Notices Modal */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Squad Notice Board</h3>
              </div>
              <button
                onClick={() => setShowAllNotices(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {activeNotices.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No announcements posted yet.</div>
              ) : (
                activeNotices.map((notice) => (
                  <div key={notice.id} className="pt-3 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notice.pinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getPriorityStyle(notice.priority)}`}>
                          {notice.priority}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{notice.title}</h4>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setShowAllNotices(false);
                              startEdit(notice);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                            title="Edit Notice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNotice(notice.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete Notice"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>By {notice.authorName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isAdmin && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setShowAllNotices(false);
                    startEdit();
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Post New Announcement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Post / Edit Notice Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-300" />
                {editNotice.id ? 'Edit Squad Notice' : 'Post Squad Notice (Admin)'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🏖️ Weekend Beach Trip this Saturday!"
                  value={editNotice.title || ''}
                  onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Details / Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full announcement details for the squad..."
                  value={editNotice.content || ''}
                  onChange={(e) => setEditNotice({ ...editNotice, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Tag
                  </label>
                  <select
                    value={editNotice.priority || 'normal'}
                    onChange={(e) =>
                      setEditNotice({ ...editNotice, priority: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="normal">Normal (Informational)</option>
                    <option value="important">Important (Highlighted)</option>
                    <option value="urgent">Urgent Alert (Amber)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={editNotice.pinned ?? true}
                      onChange={(e) => setEditNotice({ ...editNotice, pinned: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Pin to Top Bar</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {editNotice.id ? 'Save Changes' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
