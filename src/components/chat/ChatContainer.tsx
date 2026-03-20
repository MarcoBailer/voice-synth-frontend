'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { voiceService } from '@/services/voiceService';
import { MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function ChatContainer() {
  const { 
    currentConversation, 
    addMessage, 
    updateMessage, 
    isLoading, 
    setIsLoading,
    createConversation 
  } = useChat();
  const { selectedVoice } = useVoice();
  const { user, refreshCredits } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSendMessage = async (content: string, withVoice: boolean) => {
    if (!currentConversation) {
      createConversation(selectedVoice?.id);
    }

    // Add user message
    addMessage({ role: 'user', content });

    // Add loading message
    const loadingMessage = addMessage({ 
      role: 'assistant', 
      content: '', 
      isLoading: true 
    });

    setIsLoading(true);

    try {
      let response;

      if (withVoice && selectedVoice) {
        // Chat with voice response
        response = await voiceService.chatVoice({
          user_message: content,
          voice_id: selectedVoice.id,
          conversation_id: currentConversation?.id,
        });

        updateMessage(loadingMessage.id, {
          content: response.text_response,
          audioBase64: response.audio_response_base64,
          isLoading: false,
        });
      } else {
        // Text-only chat
        const language = selectedVoice?.language.toLowerCase().startsWith('port') ? 'pt' : 'en';
        response = await voiceService.chatText({
          user_message: content,
          language,
          conversation_id: currentConversation?.id,
        });

        updateMessage(loadingMessage.id, {
          content: response.text_response,
          isLoading: false,
        });
      }

      // Refresh credits after API call
      await refreshCredits();

    } catch (error: unknown) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
        if (axiosError.response?.status === 403) {
          errorMessage = 'Insufficient credits. Please add more credits to continue.';
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Please log in to continue.';
        } else if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }

      updateMessage(loadingMessage.id, {
        content: errorMessage,
        isLoading: false,
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state
  if (!currentConversation || currentConversation.messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Welcome to Voice Synth AI
            </h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Start a conversation with AI and get responses in your chosen voice. 
              Type a message below to begin.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <SuggestionCard
                icon={<MessageSquare className="w-4 h-4" />}
                text="Tell me about voice cloning"
                onClick={() => handleSendMessage('Tell me about voice cloning technology', false)}
              />
              <SuggestionCard
                icon={<MessageSquare className="w-4 h-4" />}
                text="What can you help me with?"
                onClick={() => handleSendMessage('What can you help me with?', false)}
              />
            </div>

            {user && (
              <p className="text-sm text-[var(--muted-foreground)] mt-6">
                You have <span className="text-[var(--warning)] font-medium">{user.credits}</span> credits remaining
              </p>
            )}
          </div>
        </div>

        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          disabled={!user}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {currentConversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        disabled={!user} 
      />
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({ 
  icon, 
  text, 
  onClick 
}: { 
  icon: React.ReactNode; 
  text: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] hover:border-[var(--primary)] transition-all text-left text-sm"
    >
      <span className="text-[var(--primary)]">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default ChatContainer;
