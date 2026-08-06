import React, { useMemo } from 'react';
import { Bot, Plus, Search, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUiStore } from '../../stores/useUiStore';
import type { Conversation } from '../../types/chat';
import { groupConversationsByDate } from '../../utils/date';
import { ConversationGroup } from './ConversationGroup';
import { UserSettingsSection } from './UserSettingsSection';

interface SidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
  isLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  onNewChat,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const {
    isSidebarCollapsed,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
    searchQuery,
    setSearchQuery,
  } = useUiStore();

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => {
    return groupConversationsByDate(filteredConversations);
  }, [filteredConversations]);

  const handleSelectConversation = (id: string) => {
    navigate(`/chat/${id}`);
    setMobileDrawerOpen(false);
  };

  const handleNewChatClick = () => {
    onNewChat();
    setMobileDrawerOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 border-r border-slate-800/80 shadow-md">
      {/* Product Identity Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/60">
        <div
          onClick={() => {
            navigate('/');
            setMobileDrawerOpen(false);
          }}
          className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">AI Assistant</h1>
            <span className="text-[10px] text-slate-400 font-medium">Internal Assistant</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition-all duration-150 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
            <span>New conversation</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-700/60 text-blue-100">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grouped Conversation History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <div className="space-y-2.5 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
          </div>
        ) : (
          grouped.map((group) => (
            <ConversationGroup
              key={group.label}
              group={group}
              activeConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
            />
          ))
        )}
      </div>

      {/* User / Help Footer */}
      <UserSettingsSection />
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:block h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 h-full animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
