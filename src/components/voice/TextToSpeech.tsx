'use client';

import { useState, useRef } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import { voiceService } from '@/services/voiceService';
import { 
  Volume2, 
  Play, 
  Pause, 
  Loader2, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { VoiceSelector } from './VoiceSelector';

export function TextToSpeech() {
  const { selectedVoice } = useVoice();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSynthesize = async () => {
    if (!text.trim() || !selectedVoice) return;

    setIsLoading(true);
    setAudioUrl(null);

    try {
      const response = await voiceService.synthesize({
        text: text.trim(),
        voice_id: selectedVoice.id,
      });

      const url = voiceService.base64ToAudioUrl(response.audio_base64);
      setAudioUrl(url);
      
      // Auto-play
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.play();
      setIsPlaying(true);

    } catch (error: unknown) {
      console.error('Synthesis error:', error);
      
      let message = 'Failed to synthesize speech. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
        if (axiosError.response?.status === 403) {
          message = 'Insufficient credits.';
        } else if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        }
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech-${Date.now()}.wav`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-[var(--primary)]" />
        Text to Speech
      </h3>

      <div className="space-y-4">
        {/* Voice Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Voice</label>
          <VoiceSelector compact />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Text</label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="input min-h-[150px] resize-y pr-10"
              maxLength={5000}
            />
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              title="Copy text"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
            {text.length}/5000 characters
          </p>
        </div>

        {/* Synthesize Button */}
        <button
          onClick={handleSynthesize}
          disabled={isLoading || !text.trim() || !selectedVoice}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              Synthesize Speech
            </>
          )}
        </button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="p-4 rounded-xl bg-[var(--secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1">
                <div className="voice-wave">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span 
                      key={i} 
                      style={{ 
                        animationPlayState: isPlaying ? 'running' : 'paused' 
                      }} 
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Download audio"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextToSpeech;
