import React, { useState, useRef } from 'react';
import { Image, Video, UploadCloud, X, Link as LinkIcon, Send } from 'lucide-react';

interface MediaAttachmentModalProps {
  onClose: () => void;
  onSendMedia: (params: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }) => void;
}

export const MediaAttachmentModal: React.FC<MediaAttachmentModalProps> = ({ onClose, onSendMedia }) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setError('Please upload a valid image (PNG/JPG/WEBP) or video (MP4/WEBM).');
      return;
    }

    // Convert file to Base64 Data URL so it is fully self-contained and persistent
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    const finalUrl = previewUrl || inputUrl.trim();
    if (!finalUrl) {
      setError('Please select or enter a photo or video to send.');
      return;
    }
    onSendMedia({
      mediaUrl: finalUrl,
      mediaType,
      caption: caption.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-700 rounded-lg">
              {mediaType === 'image' ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">Send Photo or Video</h3>
              <p className="text-[11px] text-emerald-200">Share with squad in chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Type and Source Selector */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('upload');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'upload' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload from Device
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('url');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'url' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Image / Video URL
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {tab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/40"
                >
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to choose photo or video</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports JPG, PNG, GIF, MP4, WEBM
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-black flex items-center justify-center">
                  {mediaType === 'image' ? (
                    <img src={previewUrl} alt="Preview" className="max-h-56 object-contain" />
                  ) : (
                    <video src={previewUrl} controls className="max-h-56 w-full" />
                  )}
                  <button
                    onClick={() => setPreviewUrl('')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Media Link (Image or Video)
                </label>
                <input
                  type="url"
                  placeholder="https://... photo or video link"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                    if (e.target.value.includes('.mp4') || e.target.value.includes('video')) {
                      setMediaType('video');
                    } else {
                      setMediaType('image');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Or choose a sample photo:</p>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Sample"
                      onClick={() => {
                        setInputUrl(src);
                        setPreviewUrl(src);
                        setMediaType('image');
                      }}
                      className="h-16 w-full object-cover rounded-lg cursor-pointer border-2 hover:border-emerald-500 transition-all"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Caption input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Add a Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="Write a message about this media..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!previewUrl && !inputUrl.trim()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Send to Chat
          </button>
        </div>
      </div>
    </div>
  );
};
