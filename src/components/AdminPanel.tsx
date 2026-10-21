import React, { useState } from 'react';
import {
  Shield,
  Users,
  Volume2,
  VolumeX,
  Lock,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  X,
  Sparkles,
  Activity,
  Megaphone,
  Image,
  Key,
  Check,
  Search,
} from 'lucide-react';
import { User, ActivityLog, SharedMedia } from '../types';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  activityLogs: ActivityLog[];
  mediaList: SharedMedia[];
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteMedia: (mediaId: string) => void;
  onAddUser: (data: { password: string; name: string; avatar: string }) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  users,
  activityLogs,
  mediaList,
  onClose,
  onUpdateUser,
  onDeleteMedia,
  onAddUser,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'media'>('members');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [memberSearch, setMemberSearch] = useState('');
  const [savedUserId, setSavedUserId] = useState<string | null>(null);

  // Quick add member state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');

  if (currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-sm text-center">
          <Shield className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">Admin Access Required</h3>
          <p className="text-xs text-slate-500 mt-1">
            Only Admin (Parvin) can access the Activity Control Center.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      statusText: user.statusText,
      password: user.password,
      isMuted: user.isMuted || false,
      isFrozen: user.isFrozen || false,
      role: user.role,
      avatar: user.avatar,
    });
  };

  const handleSaveUser = (userId: string) => {
    onUpdateUser(userId, editForm);
    setSavedUserId(userId);
    setTimeout(() => {
      setSavedUserId(null);
      setEditingUserId(null);
    }, 700);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    onAddUser({
      name: newName.trim() || `Friend #${users.length + 1}`,
      password: newPassword.trim(),
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    setNewPassword('');
    setNewName('');
    setShowAddMember(false);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.password.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/20 rounded-xl backdrop-blur-xs">
              <Shield className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">Admin Activity Control Center</h2>
                <span className="bg-black/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Parvin (Admin)
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Manage all 8 friends, passwords, permissions, mute activity, and monitor logs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends & Activity ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Squad Activity Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'media'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Album Moderation ({mediaList.length})</span>
            </button>
          </div>

          {activeTab === 'members' && (
            <button
              onClick={() => setShowAddMember(true)}
              className="text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1"
            >
              <span>+ Add Friend</span>
            </button>
          )}
        </div>

        {/* Tab 1: Members Management */}
        {activeTab === 'members' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search friends by name..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Friend Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                const isCurrentAdmin = user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      user.role === 'admin'
                        ? 'border-amber-300 bg-amber-50/40'
                        : user.isMuted
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white hover:border-emerald-300 shadow-2xs'
                    }`}
                  >
                    {!isEditing ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-2xs"
                            />
                            {user.isOnline ? (
                              <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0" />
                            ) : (
                              <span className="w-3 h-3 bg-slate-300 border-2 border-white rounded-full absolute bottom-0 right-0" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                              {user.role === 'admin' && (
                                <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm">
                                  Admin
                                </span>
                              )}
                              {user.isMuted && (
                                <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                                  <VolumeX className="w-2.5 h-2.5" /> Muted
                                </span>
                              )}
                              {user.isFrozen && (
                                <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                                  Frozen
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {user.statusText}
                            </p>
                            <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                              <Key className="w-3 h-3 text-slate-400" />
                              <span>Password: <strong>••••••••</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                            title="Edit friend details and password"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {!isCurrentAdmin && (
                            <button
                              onClick={() =>
                                onUpdateUser(user.id, { isMuted: !user.isMuted })
                              }
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                user.isMuted
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={user.isMuted ? 'Unmute friend' : 'Mute friend in chat'}
                            >
                              {user.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Inline Edit Form */
                      <div className="space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-xs font-bold text-slate-800">
                            Editing: {user.name}
                          </span>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Login Password
                            </label>
                            <input
                              type="password"
                              placeholder="Reset password..."
                              value={editForm.password || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, password: e.target.value })
                              }
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">
                            Status Text
                          </label>
                          <input
                            type="text"
                            value={editForm.statusText || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, statusText: e.target.value })
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isMuted || false}
                              onChange={(e) =>
                                setEditForm({ ...editForm, isMuted: e.target.checked })
                              }
                            />
                            <span>Muted in chat</span>
                          </label>

                          <button
                            onClick={() => handleSaveUser(user.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            {savedUserId === user.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <span>Save Changes</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Activity Logs */}
        {activeTab === 'activity' && (
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Squad Activity Stream (Latest 50 actions)</span>
            </h3>

            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No recent activity logged yet.</p>
            ) : (
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800">{log.userName}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded-sm font-semibold text-[10px]">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Media Moderation */}
        {activeTab === 'media' && (
          <div className="p-6 overflow-y-auto flex-1">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-emerald-600" />
              <span>Manage Shared Album Photos & Videos</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 overflow-hidden relative group bg-slate-900"
                >
                  <img src={m.url} alt={m.title} className="h-28 w-full object-cover" />
                  <div className="p-2 bg-white text-xs">
                    <p className="font-bold truncate text-slate-800">{m.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">By {m.uploaderName}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Admin: Delete photo "${m.title}"?`)) {
                        onDeleteMedia(m.id);
                      }
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Admin Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Add New Friend Account</h4>
              <form onSubmit={handleCreateMember} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Friend Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Robin"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
