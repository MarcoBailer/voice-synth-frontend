'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';

interface ChatInputProps {
  onSendMessage: (message: string, withVoice: boolean) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedVoice } = useVoice();

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;

    onSendMessage(trimmedMessage, voiceEnabled && !!selectedVoice);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 p-3 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] focus-within:border-[var(--primary)] transition-colors">
          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            disabled={!selectedVoice}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled && selectedVoice
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
            } ${!selectedVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={selectedVoice ? (voiceEnabled ? 'Voice enabled' : 'Voice disabled') : 'Select a voice first'}
          >
            {voiceEnabled && selectedVoice ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Type a message..."
            disabled={isLoading || disabled}
            className="flex-1 bg-transparent border-none outline-none resize-none max-h-[200px] py-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            rows={1}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            className={`p-2 rounded-lg transition-colors ${
              message.trim() && !isLoading && !disabled
                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80'
                : 'text-[var(--muted-foreground)] cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Voice indicator */}
        {selectedVoice && voiceEnabled && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
            Responses will be spoken using <span className="text-[var(--primary)]">{selectedVoice.name}</span>
          </p>
        )}

        {!selectedVoice && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
            Select a voice in the settings to enable voice responses
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatInput;
