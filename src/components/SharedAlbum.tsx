import React, { useState, useRef } from 'react';
import {
  Image,
  Upload,
  Download,
  Heart,
  MessageCircle,
  Filter,
  Search,
  Plus,
  Video,
  Sparkles,
  FolderOpen,
  X,
  CheckCircle,
} from 'lucide-react';
import { SharedMedia, User } from '../types';
import { PhotoLightbox } from './PhotoLightbox';

interface SharedAlbumProps {
  mediaList: SharedMedia[];
  currentUser: User;
  users: User[];
  onUploadMedia: (media: Omit<SharedMedia, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  onLikeMedia: (mediaId: string) => void;
  onCommentMedia: (mediaId: string, text: string) => void;
  onDeleteMedia: (mediaId: string) => void;
}

const ALBUM_CATEGORIES = [
  'All Media',
  'Trips & Vacations',
  'Weekend Hangouts',
  'Celebrations',
  'Memes & Fun',
];

export const SharedAlbum: React.FC<SharedAlbumProps> = ({
  mediaList,
  currentUser,
  users,
  onUploadMedia,
  onLikeMedia,
  onCommentMedia,
  onDeleteMedia,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState('All Media');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlbum, setUploadAlbum] = useState('Trips & Vacations');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered media
  const filteredMedia = mediaList.filter((item) => {
    const matchesAlbum = selectedAlbum === 'All Media' || item.album === selectedAlbum;
    const matchesUser = selectedUserFilter === 'all' || item.uploaderId === selectedUserFilter;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlbum && matchesUser && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setUploadType('video');
    } else if (file.type.startsWith('image/')) {
      setUploadType('image');
    } else {
      setUploadError('Please select a valid image or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      setUploadError('Please choose a photo or video to upload.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a title or caption for the photo.');
      return;
    }

    onUploadMedia({
      uploaderId: currentUser.id,
      uploaderName: currentUser.name,
      uploaderAvatar: currentUser.avatar,
      type: uploadType,
      url: mediaUrl,
      title: uploadTitle.trim(),
      album: uploadAlbum,
    });

    // Reset and close
    setMediaUrl('');
    setUploadTitle('');
    setIsUploadOpen(false);
  };

  const downloadDirect = (e: React.MouseEvent, item: SharedMedia) => {
    e.stopPropagation();
    const filename = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'squad-photo'}.${
      item.type === 'video' ? 'mp4' : 'jpg'
    }`;
    const link = document.createElement('a');
    link.href = item.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentLightboxMedia =
    activeLightboxIndex !== null ? filteredMedia[activeLightboxIndex] : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white px-6 py-6 border-b border-emerald-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <FolderOpen className="w-4 h-4" />
              <span>Squad Photo & Video Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Shared Photo Album</h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Everyone can upload high-res photos and videos. Every friend can download any photo with 1 click!
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo / Video</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Album categories pill selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {ALBUM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedAlbum(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedAlbum === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right side: User filter + Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Uploaded by: Anyone</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mt-6 mb-12">
          {filteredMedia.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base">No media found in this album</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Be the first to upload memories, party snaps, or road trip videos!
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Upload Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item, index) => {
                const isLiked = item.likes.includes(currentUser.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveLightboxIndex(index)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                      {item.type === 'video' ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                              <Video className="w-5 h-5" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}

                      {/* Album badge */}
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.album}
                      </span>

                      {/* DIRECT DOWNLOAD BUTTON (Prominent on hover) */}
                      <button
                        onClick={(e) => downloadDirect(e, item)}
                        className="absolute bottom-2.5 right-2.5 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1 text-xs font-bold opacity-90 group-hover:opacity-100"
                        title="Download full quality photo to device"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Download</span>
                      </button>
                    </div>

                    {/* Card Details */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={item.uploaderAvatar}
                            alt={item.uploaderName}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="text-xs text-slate-500 font-medium truncate">
                            {item.uploaderName}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Likes, Comments & Download link */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLikeMedia(item.id);
                            }}
                            className={`flex items-center gap-1 hover:text-rose-600 transition-colors ${
                              isLiked ? 'text-rose-600 font-bold' : ''
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                            <span>{item.likes.length}</span>
                          </button>

                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{item.comments.length}</span>
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {item.timestamp.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Upload to Shared Album</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormUpload} className="p-6 space-y-4">
              {uploadError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                  {uploadError}
                </p>
              )}

              {/* Upload picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Photo or Video File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!mediaUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      Click to choose photo or video from device
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, MP4 (Anyone will be able to download it)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-h-52 flex items-center justify-center">
                    {uploadType === 'video' ? (
                      <video src={mediaUrl} controls className="max-h-52 w-full object-contain" />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="max-h-52 w-full object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title / Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Photo Title / Caption
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset drinks with the squad 🌅"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Album Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Album Category
                </label>
                <select
                  value={uploadAlbum}
                  onChange={(e) => setUploadAlbum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
                >
                  <option value="Trips & Vacations">Trips & Vacations</option>
                  <option value="Weekend Hangouts">Weekend Hangouts</option>
                  <option value="Celebrations">Celebrations</option>
                  <option value="Memes & Fun">Memes & Fun</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish to Shared Album</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && currentLightboxMedia && (
        <PhotoLightbox
          media={currentLightboxMedia}
          currentUser={currentUser}
          onClose={() => setActiveLightboxIndex(null)}
          onLike={onLikeMedia}
          onComment={onCommentMedia}
          onDeleteMedia={onDeleteMedia}
          hasPrev={activeLightboxIndex > 0}
          hasNext={activeLightboxIndex < filteredMedia.length - 1}
          onNavigate={(dir) => {
            if (dir === 'prev' && activeLightboxIndex > 0) {
              setActiveLightboxIndex(activeLightboxIndex - 1);
            } else if (dir === 'next' && activeLightboxIndex < filteredMedia.length - 1) {
              setActiveLightboxIndex(activeLightboxIndex + 1);
            }
          }}
        />
      )}
    </div>
  );
};
