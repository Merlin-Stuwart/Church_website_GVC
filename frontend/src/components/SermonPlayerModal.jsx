import React, { useState, useEffect } from 'react';
import { X, Play, Volume2, BookOpen, Share2, Check, Download, Video, ExternalLink } from 'lucide-react';

export function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  return url;
}

export default function SermonPlayerModal({ sermon, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('video');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('video');
      setCopied(false);
    }
  }, [isOpen, sermon?.id]);

  if (!isOpen || !sermon) return null;

  const handleCopyLink = () => {
    try {
      navigator.clipboard?.writeText(window.location.origin + `/sermons?id=${sermon.id}`)?.catch(() => {});
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = getYouTubeEmbedUrl(sermon.video_url);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {sermon.series || 'Sunday Service'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{sermon.language}</span>
          </div>

          <div className="flex items-center gap-2">
            {sermon.video_url && (
              <a
                href={sermon.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            )}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Share Sermon"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Player Area */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {activeTab === 'video' ? (
            <div className="w-full h-full">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={sermon.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Video stream not available
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-4 shadow-sm">
                <Volume2 className="w-10 h-10 animate-pulse" />
              </div>
              <h4 className="font-serif font-bold text-xl text-slate-900 mb-1">{sermon.title}</h4>
              <p className="text-xs text-amber-800 font-semibold mb-6">{sermon.speaker}</p>
              
              <audio controls className="w-full max-w-md accent-amber-600">
                <source src={sermon.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Bottom Details & Tabs */}
        <div className="p-6 sm:p-8 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-950 mb-1">
                {sermon.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="font-bold text-amber-700">{sermon.speaker}</span>
                <span>•</span>
                <span>{sermon.date}</span>
                <span>•</span>
                <span>Duration: {sermon.duration || '45 mins'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'video' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'audio' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Podcast</span>
              </button>
            </div>
          </div>

          {/* Scripture badge */}
          {sermon.scripture && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-800 block">
                  Scripture Reading
                </span>
                <p className="text-sm text-slate-800 font-semibold">
                  {sermon.scripture}
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            {sermon.summary}
          </p>
        </div>

      </div>
    </div>
  );
}
