import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  mediaUrl: string;
  duration?: number;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration = 38, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const timerRef = useRef<any>(null);

  // Dynamic waveform bars
  const bars = [30, 45, 75, 90, 60, 40, 80, 100, 70, 50, 65, 85, 95, 45, 60, 80, 55, 70, 90, 65, 40, 60, 75, 90, 50, 40, 60, 80];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2 * playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            setProgress(0);
            return 0;
          }
          setProgress((next / duration) * 100);
          return next;
        });
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    if (playbackRate === 1) setPlaybackRate(1.5);
    else if (playbackRate === 1.5) setPlaybackRate(2);
    else setPlaybackRate(1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#181A20]/90 border border-[#2B2F36] rounded-xl p-3 max-w-md w-full shadow-lg">
      <div className="flex items-center gap-3">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] flex items-center justify-center transition-transform active:scale-95 shadow-md flex-shrink-0"
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Waveform & Progress */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-[2.5px] h-8 cursor-pointer select-none">
            {bars.map((height, idx) => {
              const barProgress = (idx / bars.length) * 100;
              const isPlayed = barProgress <= progress;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    const targetSec = (idx / bars.length) * duration;
                    setCurrentTime(targetSec);
                    setProgress((targetSec / duration) * 100);
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlayed ? 'bg-[#F3BA2F]' : 'bg-[#474D57]'
                  }`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>

          {/* Time & speed */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] mt-1">
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={cycleSpeed}
                className="px-1.5 py-0.5 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] text-[10px] font-semibold tracking-wider flex items-center gap-0.5"
              >
                <FastForward className="w-2.5 h-2.5" />
                {playbackRate}x
              </button>
              <Volume2 className="w-3.5 h-3.5 text-[#848E9C]" />
            </div>
          </div>
        </div>
      </div>
      {title && (
        <div className="text-xs text-[#B7BDC6] mt-2 font-medium truncate">
          {title}
        </div>
      )}
    </div>
  );
};
