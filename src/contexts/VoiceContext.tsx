'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Voice } from '@/types';

interface VoiceContextType {
  voices: Voice[];
  selectedVoice: Voice | null;
  customVoices: Voice[];
  isLoadingVoices: boolean;
  setVoices: (voices: Voice[]) => void;
  setCustomVoices: (voices: Voice[]) => void;
  selectVoice: (voice: Voice | null) => void;
  addCustomVoice: (voice: Voice) => void;
  removeCustomVoice: (voiceId: string) => void;
  getAllVoices: () => Voice[];
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [customVoices, setCustomVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  const selectVoice = useCallback((voice: Voice | null) => {
    setSelectedVoice(voice);
    if (voice) {
      localStorage.setItem('selectedVoiceId', voice.id);
    } else {
      localStorage.removeItem('selectedVoiceId');
    }
  }, []);

  const addCustomVoice = useCallback((voice: Voice) => {
    setCustomVoices((prev) => [...prev, voice]);
  }, []);

  const removeCustomVoice = useCallback((voiceId: string) => {
    setCustomVoices((prev) => prev.filter((v) => v.id !== voiceId));
    if (selectedVoice?.id === voiceId) {
      setSelectedVoice(null);
    }
  }, [selectedVoice]);

  const getAllVoices = useCallback(() => {
    return [...voices, ...customVoices];
  }, [voices, customVoices]);

  return (
    <VoiceContext.Provider
      value={{
        voices,
        selectedVoice,
        customVoices,
        isLoadingVoices,
        setVoices,
        setCustomVoices,
        selectVoice,
        addCustomVoice,
        removeCustomVoice,
        getAllVoices,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
