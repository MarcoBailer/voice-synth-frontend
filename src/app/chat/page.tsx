'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useVoice } from '@/contexts/VoiceContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { VoiceSelector } from '@/components/voice/VoiceSelector';
import { Settings, X } from 'lucide-react';

export default function ChatPage() {
  const { user, isLoading, login } = useAuth();
  const { createConversation, currentConversation } = useChat();
  const { selectedVoice } = useVoice();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-create conversation on first load
  useEffect(() => {
    if (!currentConversation && !isLoading) {
      createConversation(selectedVoice?.id);
    }
  }, []);

  const handleNewChat = () => {
    createConversation(selectedVoice?.id);
    setShowSettings(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="pt-32 px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-[var(--muted-foreground)] mb-6">
              Please sign in to access the chat feature.
            </p>
            <button onClick={login} className="btn btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <Sidebar onNewChat={handleNewChat} />

      {/* Main Chat Area */}
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        <div className="h-[calc(100vh-4rem)] flex flex-col relative">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors"
            title="Voice Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Chat Container */}
          <ChatContainer />

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-0 right-0 w-80 h-full bg-[var(--card)] border-l border-[var(--border)] shadow-xl z-20 overflow-y-auto">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-semibold">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-md hover:bg-[var(--secondary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <VoiceSelector />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
