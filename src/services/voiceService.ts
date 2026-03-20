import { voiceApi } from '@/lib/api';
import {
  Voice,
  ChatTextRequest,
  ChatTextResponse,
  ChatVoiceRequest,
  ChatVoiceResponse,
  SynthesizeRequest,
  SynthesizeResponse,
  CreditInfo,
  CreditResponse,
} from '@/types';

export const voiceService = {
  /**
   * Get available voices for synthesis
   */
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await voiceApi.get<{ available_voices: string[]; voices?: Voice[] }>('/voices');

      if (response.data.voices && response.data.voices.length > 0) {
        return response.data.voices.map((voice) => ({
          ...voice,
          isDefault: true,
          isCustom: false,
        }));
      }

      // Fallback for legacy payloads that only return voice IDs
      return response.data.available_voices.map((id) => {
        const parts = id.split('_');
        const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const language = parts[1] || 'en';
        
        return {
          id,
          name,
          language: language === 'pt' ? 'Portuguese' : 'English',
          isDefault: true,
          isCustom: false,
        };
      });
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  },

  /**
   * Get user's custom voices
   */
  async getCustomVoices(): Promise<Voice[]> {
    try {
      const response = await voiceApi.get<{ voices: Voice[] }>('/voices/custom');
      return response.data.voices.map(v => ({
        ...v,
        isDefault: false,
        isCustom: true,
      }));
    } catch (error) {
      console.error('Failed to get custom voices:', error);
      return [];
    }
  },

  /**
   * Send text message to AI chat
   */
  async chatText(request: ChatTextRequest): Promise<ChatTextResponse> {
    const response = await voiceApi.post<ChatTextResponse>('/chat/text', request);
    return response.data;
  },

  /**
   * Send message and get voice response
   */
  async chatVoice(request: ChatVoiceRequest): Promise<ChatVoiceResponse> {
    const response = await voiceApi.post<ChatVoiceResponse>('/chat/voice', request);
    return response.data;
  },

  /**
   * Synthesize text to speech
   */
  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResponse> {
    const response = await voiceApi.post<SynthesizeResponse>('/synthesize', request);
    return response.data;
  },

  /**
   * Clone a voice with audio samples
   */
  async cloneVoice(name: string, language: string, samples: File[]): Promise<Voice> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('language', language);
    samples.forEach((sample) => {
      formData.append('samples', sample);
    });

    const response = await voiceApi.post<Voice>('/voices/clone', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      ...response.data,
      isDefault: false,
      isCustom: true,
    };
  },

  /**
   * Delete a custom voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    await voiceApi.delete(`/voices/${voiceId}`);
  },

  /**
   * Get user's credit balance
   */
  async getCredits(): Promise<CreditInfo> {
    const response = await voiceApi.get<CreditResponse>('/credits');
    return response.data.credits;
  },

  /**
   * Convert base64 audio to playable URL
   */
  base64ToAudioUrl(base64: string): string {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  },
};

export default voiceService;
