import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioMessagePlayerProps {
  audioData: string; // Base64 encoded audio
  duration: number; // Duração em segundos
  sender: 'me' | 'peer';
}

export function AudioMessagePlayer({ audioData, duration, sender }: AudioMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Criar elemento de áudio
    const audio = new Audio(audioData);
    audioRef.current = audio;

    audio.addEventListener('loadeddata', () => {
      setIsLoading(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
      setIsPlaying(false);
    });

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      audio.pause();
      audio.src = '';
    };
  }, [audioData]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);

        // Atualizar progresso
        progressIntervalRef.current = window.setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 100);
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg min-w-[200px] max-w-[300px]",
      sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'
    )}>
      {/* Botão Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={isLoading}
        className={cn(
          "shrink-0 w-8 h-8",
          sender === 'me' 
            ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
            : 'hover:bg-background'
        )}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Barra de progresso e duração */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Barra de progresso */}
        <div 
          className={cn(
            "h-1 rounded-full cursor-pointer relative",
            sender === 'me' ? 'bg-primary-foreground/30' : 'bg-background'
          )}
          onClick={handleSeek}
        >
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              sender === 'me' ? 'bg-primary-foreground' : 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tempo */}
        <div className="flex items-center justify-between text-xs">
          <span className={sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
            {formatTime(currentTime)}
          </span>
          <span className={sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
