'use client';

import { Message } from '@/types';
import { User, Bot, Volume2, Pause, Play, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { formatDuration } from '@/lib/utils';
import { voiceService } from '@/services/voiceService';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);

  const isUser = message.role === 'user';
  const hasAudio = message.audioBase64 || message.audioUrl;

  useEffect(() => {
    // Convert base64 to audio URL if needed
    if (message.audioBase64 && !audioUrl.current) {
      audioUrl.current = voiceService.base64ToAudioUrl(message.audioBase64);
    }

    return () => {
      // Cleanup audio URL on unmount
      if (audioUrl.current) {
        URL.revokeObjectURL(audioUrl.current);
      }
    };
  }, [message.audioBase64]);

  const handlePlayPause = () => {
    if (!audioRef.current) {
      const url = message.audioUrl || audioUrl.current;
      if (!url) return;

      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setAudioProgress(audioRef.current.currentTime);
        }
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setAudioDuration(audioRef.current.duration);
        }
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (message.isLoading) {
    return (
      <div className="flex gap-4 message-enter">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 message-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-[var(--secondary)]'
            : 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[var(--primary)] text-white rounded-tr-sm'
              : 'bg-[var(--secondary)] rounded-tl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Audio Player */}
        {hasAudio && !isUser && (
          <div className="mt-2 audio-player max-w-xs">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1">
              <div className="audio-progress">
                <div
                  className="audio-progress-bar"
                  style={{
                    width: audioDuration > 0
                      ? `${(audioProgress / audioDuration) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                <span>{formatDuration(audioProgress)}</span>
                <span>{formatDuration(audioDuration)}</span>
              </div>
            </div>

            <Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
