import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/useUiStore';
import type { Conversation } from '../../types/chat';

interface RenameDialogProps {
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({ onRename }) => {
  const { activeModal, activeModalData, closeModal } = useUiStore();
  const conversation = activeModalData as Conversation | null;

  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (conversation) {
      setTitle(conversation.title);
    }
  }, [conversation]);

  if (activeModal !== 'renameDialog' || !conversation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onRename(conversation.id, trimmed);
      closeModal();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Rename Conversation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Conversation Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
            placeholder="Enter title..."
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Title'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
