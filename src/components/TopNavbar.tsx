import React from 'react';
import {
  MessageSquare,
  Image,
  Shield,
  LogOut,
  Users,
  Settings,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { User } from '../types';

interface TopNavbarProps {
  currentTab: 'chat' | 'album';
  onSelectTab: (tab: 'chat' | 'album') => void;
  currentUser: User;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onSwitchUserPrompt: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  onSwitchUserPrompt,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-900/60 shadow-md z-30 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-13 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-xs">
            FS
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              <span>FriendSquad</span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 font-bold px-1.5 py-0.2 rounded-full border border-emerald-700">
                WhatsApp + Vault
              </span>
            </h1>
          </div>
        </div>

        {/* Center Main Navigation Tabs */}
        <div className="flex items-center gap-1 bg-emerald-900/60 p-1 rounded-xl border border-emerald-800/80">
          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Chat</span>
          </button>

          <button
            onClick={() => onSelectTab('album')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'album'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Shared Album</span>
          </button>
        </div>

        {/* Right User Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2 sm:px-2.5 py-1 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1 shadow-xs transition-transform active:scale-95"
              title="Admin Control Center"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin Panel</span>
            </button>
          )}

          {/* Quick Friend Switcher */}
          <button
            onClick={onSwitchUserPrompt}
            className="p-1.5 text-xs text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors flex items-center gap-1"
            title="Switch Friend Account"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Switch Friend</span>
          </button>

          {/* Current user badge */}
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-emerald-900/60 transition-colors"
            title="Edit Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-400"
            />
            <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-1.5 text-emerald-300 hover:text-rose-300 hover:bg-emerald-900 rounded-lg transition-colors"
            title="Lock / Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
