'use client';

import { useChat } from '@/contexts/ChatContext';
import { useVoice } from '@/contexts/VoiceContext';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const { conversations, currentConversation, selectConversation, deleteConversation } = useChat();
  const { selectedVoice } = useVoice();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className={`btn btn-primary w-full ${isCollapsed ? 'px-3' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
              Conversations
            </p>
          )}
          
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item group relative rounded-lg ${
                  currentConversation?.id === conv.id ? 'active' : ''
                }`}
              >
                <button
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    isCollapsed ? 'flex justify-center' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 shrink-0 text-[var(--muted-foreground)]" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{conv.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatDistanceToNow(conv.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </button>

                {/* Delete Button */}
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-[var(--destructive)] hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {conversations.length === 0 && !isCollapsed && (
              <p className="text-center text-sm text-[var(--muted-foreground)] py-8">
                No conversations yet
              </p>
            )}
          </div>
        </div>

        {/* Selected Voice Indicator */}
        {selectedVoice && !isCollapsed && (
          <div className="p-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Active Voice</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
              <span className="text-sm font-medium">{selectedVoice.name}</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn btn-ghost w-full justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
