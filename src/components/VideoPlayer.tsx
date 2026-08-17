import React, { useState } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  mediaUrl: string;
  thumbnail?: string;
  caption?: string;
  duration?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ thumbnail, caption, duration = 45 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden bg-[#181A20] border border-[#2B313A] max-w-md w-full shadow-lg relative group">
      {/* Video / Preview Container */}
      <div className="relative aspect-video bg-gradient-to-br from-[#1E2329] to-[#0B0E11] flex items-center justify-center overflow-hidden">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80'}
          alt="Video Preview"
          className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-80' : 'opacity-90'}`}
        />

        {/* Play Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#0B0E11]/80 hover:bg-[#F0B90B] text-white hover:text-black border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all transform group-hover:scale-105 active:scale-95 shadow-2xl"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>

        {/* Top Duration Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono text-white/90">
          0:{duration < 10 ? '0' : ''}{duration}
        </div>

        {/* Bottom Floating Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-[#F0B90B] transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-[#F0B90B] transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <button className="text-white hover:text-[#F0B90B] transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {caption && (
        <div className="p-3 text-xs text-[#EAECEF] bg-[#1E2329]/80 border-t border-[#2B313A]/50">
          {caption}
        </div>
      )}
    </div>
  );
};
