import React from 'react';
import type { GroupedConversations } from '../../types/chat';
import { ConversationItem } from './ConversationItem';

interface ConversationGroupProps {
  group: GroupedConversations;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export const ConversationGroup: React.FC<ConversationGroupProps> = ({
  group,
  activeConversationId,
  onSelectConversation,
}) => {
  return (
    <div className="space-y-1 mb-4">
      <h3 className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
        {group.label}
      </h3>
      <div className="space-y-0.5">
        {group.conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onSelect={onSelectConversation}
          />
        ))}
      </div>
    </div>
  );
};
