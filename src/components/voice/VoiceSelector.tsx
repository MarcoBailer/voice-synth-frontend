'use client';

import { useState, useEffect } from 'react';
import { Voice } from '@/types';
import { useVoice } from '@/contexts/VoiceContext';
import { voiceService } from '@/services/voiceService';
import { 
  Mic, 
  Languages, 
  Check, 
  ChevronDown,
  Sparkles,
  User
} from 'lucide-react';

interface VoiceSelectorProps {
  onSelect?: (voice: Voice) => void;
  compact?: boolean;
}

export function VoiceSelector({ onSelect, compact = false }: VoiceSelectorProps) {
  const { voices, customVoices, selectedVoice, selectVoice, setVoices, setCustomVoices } = useVoice();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = async () => {
      setIsLoading(true);
      try {
        const [defaultVoices, userVoices] = await Promise.all([
          voiceService.getVoices(),
          voiceService.getCustomVoices(),
        ]);
        setVoices(defaultVoices);
        setCustomVoices(userVoices);

        // Auto-select first voice if none selected
        if (!selectedVoice && defaultVoices.length > 0) {
          const savedVoiceId = localStorage.getItem('selectedVoiceId');
          const allVoices = [...defaultVoices, ...userVoices];
          const savedVoice = allVoices.find(v => v.id === savedVoiceId);
          selectVoice(savedVoice || defaultVoices[0]);
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoices();
  }, [setVoices, setCustomVoices, selectedVoice, selectVoice]);

  const handleSelect = (voice: Voice) => {
    selectVoice(voice);
    setIsOpen(false);
    onSelect?.(voice);
  };

  const allVoices = [...voices, ...customVoices];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
        >
          <Mic className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm">
            {isLoading ? 'Loading...' : selectedVoice?.name || 'Select Voice'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl z-50 max-h-80 overflow-y-auto">
            {allVoices.length === 0 ? (
              <p className="p-4 text-sm text-[var(--muted-foreground)]">No voices available</p>
            ) : (
              <>
                {voices.length > 0 && (
                  <>
                    <p className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Default Voices
                    </p>
                    {voices.map((voice) => (
                      <VoiceOption
                        key={voice.id}
                        voice={voice}
                        isSelected={selectedVoice?.id === voice.id}
                        onClick={() => handleSelect(voice)}
                      />
                    ))}
                  </>
                )}

                {customVoices.length > 0 && (
                  <>
                    <div className="border-t border-[var(--border)] my-2" />
                    <p className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Your Voices
                    </p>
                    {customVoices.map((voice) => (
                      <VoiceOption
                        key={voice.id}
                        voice={voice}
                        isSelected={selectedVoice?.id === voice.id}
                        onClick={() => handleSelect(voice)}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Voice</h3>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-[var(--muted)] rounded w-24 mb-2" />
              <div className="h-3 bg-[var(--muted)] rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Default Voices */}
          {voices.length > 0 && (
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Default Voices
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice?.id === voice.id}
                    onClick={() => handleSelect(voice)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Voices */}
          {customVoices.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Cloned Voices
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice?.id === voice.id}
                    onClick={() => handleSelect(voice)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Voice Option for compact dropdown
function VoiceOption({ 
  voice, 
  isSelected, 
  onClick 
}: { 
  voice: Voice; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors ${
        isSelected ? 'bg-[var(--secondary)]' : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        voice.isCustom 
          ? 'bg-[var(--accent)]/20' 
          : 'bg-[var(--primary)]/20'
      }`}>
        <Mic className={`w-4 h-4 ${
          voice.isCustom ? 'text-[var(--accent)]' : 'text-[var(--primary)]'
        }`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{voice.name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{voice.language}</p>
      </div>
      {isSelected && <Check className="w-4 h-4 text-[var(--success)]" />}
    </button>
  );
}

// Voice Card for full view
function VoiceCard({ 
  voice, 
  isSelected, 
  onClick 
}: { 
  voice: Voice; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card text-left relative transition-all ${
        isSelected 
          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' 
          : 'hover:border-[var(--primary)]/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          voice.isCustom 
            ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--primary)]' 
            : 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]'
        }`}>
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{voice.name}</p>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Languages className="w-3 h-3" />
            <span>{voice.language}</span>
          </div>
          {voice.isCustom && (
            <span className="badge badge-primary text-xs mt-2">Custom</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default VoiceSelector;
