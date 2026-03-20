// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  avatarUrl?: string;
}

// Voice Types
export interface Voice {
  id: string;
  name: string;
  language: string;
  description?: string;
  previewUrl?: string;
  isDefault: boolean;
  isCustom: boolean;
  createdAt?: string;
}

export interface VoiceSample {
  id: string;
  filename: string;
  duration: number;
  uploadedAt: string;
}

// Chat Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  audioBase64?: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  voiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface ChatTextRequest {
  user_message: string;
  language: string;
  conversation_id?: string;
}

export interface ChatTextResponse {
  text_response: string;
  conversation_id: string;
}

export interface ChatVoiceRequest {
  user_message: string;
  voice_id: string;
  conversation_id?: string;
}

export interface ChatVoiceResponse {
  text_response: string;
  audio_response_base64: string;
  conversation_id: string;
}

export interface SynthesizeRequest {
  text: string;
  voice_id: string;
}

export interface SynthesizeResponse {
  audio_base64: string;
  duration?: number;
}

export interface VoiceCloneRequest {
  name: string;
  language: string;
  samples: File[];
}

// Credit Types
export interface CreditInfo {
  current: number;
  used: number;
  total: number;
}

export interface CreditResponse {
  credits: CreditInfo;
  costs: Record<string, number>;
}

// API Error
export interface ApiError {
  detail: string;
  status_code?: number;
}
