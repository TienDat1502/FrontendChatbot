import React from 'react';
import { FileText, Image as ImageIcon, File, X } from 'lucide-react';
import type { Attachment } from '../../types/chat';

interface FilePreviewProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ attachment, onRemove }) => {
  const getIcon = () => {
    switch (attachment.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[200px]">
      <div className="shrink-0">{getIcon()}</div>
      <div className="truncate flex-1">
        <p className="truncate text-zinc-900 dark:text-zinc-100 font-medium">{attachment.name}</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{formatSize(attachment.size)}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
