import React from 'react';
import { ArrowDown } from 'lucide-react';
import type { Message, StreamingMessageState } from '../../types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { useChatScroll } from '../../hooks/useChatScroll';

interface ChatMessagesListProps {
  messages: Message[];
  onRegenerate?: (messageId: string) => void;
  isLoading?: boolean;
  streamingState?: Record<string, StreamingMessageState>;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  onRegenerate,
  isLoading,
  streamingState,
}) => {
  const streamFingerprint = React.useMemo(
    () =>
      Object.values(streamingState || {})
        .map((entry) => `${entry.status}:${entry.content}`)
        .join('|'),
    [streamingState]
  );

  const { containerRef, showScrollToBottom, scrollToBottom, handleScroll } = useChatScroll({
    dependencies: [messages, messages.map((m) => m.content).join(''), streamFingerprint],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const actualLastAssistantIndex =
    lastAssistantIndex !== -1 ? messages.length - 1 - lastAssistantIndex : -1;

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="pb-8">
          {messages.map((msg, index) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onRegenerate={onRegenerate}
              isLastAssistant={index === actualLastAssistantIndex}
              streamingState={streamingState?.[msg.id]}
            />
          ))}
        </div>
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollToBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-6 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 animate-in fade-in zoom-in-95 cursor-pointer z-20"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
