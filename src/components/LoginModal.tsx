import React, { useState, useRef } from 'react';
import { Lock, KeyRound, UserPlus, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, Upload, Camera } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  users: User[];
  onLogin: (password: string) => { success: boolean; user?: User; error?: string };
  onRegister: (data: { password: string; name?: string; avatar?: string; statusText?: string }) => {
    success: boolean;
    user?: User;
    error?: string;
  };
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ];

  const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomAvatarPreview(dataUrl);
      setSelectedAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const res = onLogin(password.trim());
    if (!res.success) {
      setError(res.error || 'Incorrect password.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword.trim()) {
      setError('Please choose a password for your account.');
      return;
    }

    const res = onRegister({
      password: newPassword.trim(),
      name: newName.trim(),
      avatar: selectedAvatar,
      statusText: newStatus.trim() || 'Ready to chat with the squad! 💬',
    });

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Password-Only Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            FriendSquad
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xs mx-auto">
            Private WhatsApp-style chat and shared media album.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex justify-center mt-5">
            <div className="bg-emerald-950/40 p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-emerald-900 shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                  mode === 'register'
                    ? 'bg-white text-emerald-900 shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Member</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter Your Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5 text-emerald-600" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Don't have a password yet? Create one here →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Create your account with only a password. You will be automatically added to the main group chat!
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Password (Required)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Choose your password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your name or nickname"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Profile Picture
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload from device</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatar}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {customAvatarPreview && (
                      <div className="relative rounded-full p-0.5 ring-3 ring-emerald-500 shrink-0">
                        <img
                          src={customAvatarPreview}
                          alt="Custom"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 bg-white rounded-full absolute -top-1 -right-1" />
                      </div>
                    )}
                    {sampleAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setCustomAvatarPreview(null);
                        }}
                        className={`relative rounded-full p-0.5 transition-all shrink-0 ${
                          selectedAvatar === url && !customAvatarPreview
                            ? 'ring-3 ring-emerald-500 scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt="Avatar Option"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedAvatar === url && !customAvatarPreview && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 bg-white rounded-full absolute -top-1 -right-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status / Bio
                  </label>
                  <input
                    type="text"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="e.g. Always ready to hang out ✨"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Join Squad</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Already have a password? Sign in here →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
