import React, { useState, useRef } from 'react';
import { Camera, X, Check, Save, User as UserIcon, Lock, Sparkles, Upload, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateProfile: (updatedData: Partial<User>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onClose,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [statusText, setStatusText] = useState(currentUser.statusText);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [password, setPassword] = useState(currentUser.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    onUpdateProfile({
      name: name.trim(),
      statusText: statusText.trim(),
      avatar,
      password: password.trim(),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Your Profile</h3>
              <p className="text-xs text-emerald-200">Change photo, name, status & password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Profile Photo Editor with upload & presets */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Upload Photo from Device"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Change</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomPhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>
          </div>

          {/* Quick Preset Avatars */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Or Choose an Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`relative rounded-full p-0.5 transition-all shrink-0 ${
                    avatar === url ? 'ring-3 ring-emerald-600 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Preset" className="w-10 h-10 rounded-full object-cover" />
                  {avatar === url && (
                    <Check className="w-3.5 h-3.5 bg-emerald-600 text-white rounded-full p-0.5 absolute -top-1 -right-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Status / Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              About / Status
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="e.g. Living in the sunshine ☀️"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Login Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              You use this password to sign into your account.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
