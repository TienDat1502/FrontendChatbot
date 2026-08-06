import React, { useState } from 'react';
import { MessageSquare, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import type { Conversation } from '../../types/chat';
import { useUiStore } from '../../stores/useUiStore';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const openModal = useUiStore((s) => s.openModal);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    openModal('renameDialog', conversation);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    openModal('deleteConfirm', conversation);
  };

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
        isActive
          ? 'bg-blue-600/90 text-white font-semibold shadow-xs'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-6">
        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        <span className="truncate">{conversation.title}</span>
      </div>

      {/* More Options Button */}
      <button
        type="button"
        onClick={handleMenuClick}
        className={`p-1 rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-opacity cursor-pointer ${
          showMenu || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Conversation options"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-2 top-9 z-50 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs text-slate-200 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={handleRename}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-900/40 hover:text-red-400 text-red-400 transition-colors cursor-pointer text-left"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
