'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, Conversation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createConversation: (voiceId?: string) => Conversation;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearCurrentConversation: () => void;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'voice-synth-conversations';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    return [];
  });

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever conversations change
  const saveConversations = useCallback((convs: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, []);

  const createConversation = useCallback((voiceId?: string): Conversation => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      voiceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      saveConversations(updated);
      return updated;
    });

    setCurrentConversation(newConversation);
    return newConversation;
  }, [saveConversations]);

  const selectConversation = useCallback((conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    setCurrentConversation(conv || null);
  }, [conversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      saveConversations(updated);
      return updated;
    });

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  }, [currentConversation, saveConversations]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>): Message => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    setCurrentConversation((prev) => {
      if (!prev) return prev;

      const updatedConv = {
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date(),
        // Set title from first user message
        title: prev.messages.length === 0 && message.role === 'user'
          ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
          : prev.title,
      };

      setConversations((convs) => {
        const updated = convs.map((c) =>
          c.id === updatedConv.id ? updatedConv : c
        );
        saveConversations(updated);
        return updated;
      });

      return updatedConv;
    });

    return newMessage;
  }, [saveConversations]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setCurrentConversation((prev) => {
      if (!prev) return prev;

      const updatedConv = {
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
        updatedAt: new Date(),
      };

      setConversations((convs) => {
        const updated = convs.map((c) =>
          c.id === updatedConv.id ? updatedConv : c
        );
        saveConversations(updated);
        return updated;
      });

      return updatedConv;
    });
  }, [saveConversations]);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        createConversation,
        selectConversation,
        deleteConversation,
        addMessage,
        updateMessage,
        clearCurrentConversation,
        setIsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
