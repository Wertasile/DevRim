import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  messageId?: string;
  isOwnMessage?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, messageId, isOwnMessage = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Transparent background to blend with message bubble
  const playerBgColor = 'bg-transparent';
  
  const buttonColor = isOwnMessage
    ? 'bg-black/50 hover:bg-black/70'
    : 'bg-white/50 hover:bg-white/70';
  
  const progressBgColor = isOwnMessage
    ? 'bg-black/30'
    : 'bg-white/20';
  
  const progressFillColor = isOwnMessage
    ? 'bg-black'
    : 'bg-white/80';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${playerBgColor} min-w-[250px] max-w-[300px]`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className={`${buttonColor} p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
        ) : isPlaying ? (
          <Pause size={16}/>
        ) : (
          <Play size={16}/>
        )}
      </button>

      {/* Progress Bar and Time */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className={`relative h-1.5 ${progressBgColor} rounded-full cursor-pointer group`}
        >
          <div
            className={`absolute h-full ${progressFillColor} rounded-full transition-all duration-100`}
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className={`absolute w-3 h-3 ${progressFillColor} rounded-full opacity-0 group-hover:opacity-100 transition-opacity -top-1 -translate-x-1/2 shadow-lg`}
            style={{ left: `${progressPercentage}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-xs text-black/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Button */}
      <button
        onClick={toggleMute}
        className={`${buttonColor} p-2 transition-colors flex-shrink-0`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX size={14}/>
        ) : (
          <Volume2 size={14}/>
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;

