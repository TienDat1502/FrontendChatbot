import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/useUiStore';
import type { Conversation } from '../../types/chat';

interface DeleteConfirmDialogProps {
  onDelete: (id: string) => Promise<void>;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ onDelete }) => {
  const { activeModal, activeModalData, closeModal } = useUiStore();
  const conversation = activeModalData as Conversation | null;
  const [isDeleting, setIsDeleting] = useState(false);

  if (activeModal !== 'deleteConfirm' || !conversation) return null;

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete(conversation.id);
      closeModal();
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Delete Conversation">
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">"{conversation.title}"</strong>?
          This action cannot be undone and all associated messages will be lost.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Chat'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
