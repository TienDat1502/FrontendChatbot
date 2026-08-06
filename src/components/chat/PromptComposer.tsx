import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';
import type { Attachment, AttachmentType } from '../../types/chat';
import { FilePreview } from '../ui/FilePreview';
import { Tooltip } from '../ui/Tooltip';

interface PromptComposerProps {
  onSend: (content: string, attachments: Attachment[]) => void;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
  compact?: boolean;
  placeholder?: string;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSend,
  isGenerating = false,
  onStopGeneration,
  compact = false,
  placeholder = 'Ask AI Assistant...',
}) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const textareaRef = useAutoResizeTextarea(value, 180);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) return;
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;

    onSend(trimmed, attachments);
    setValue('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      let type: AttachmentType = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.includes('pdf')) type = 'pdf';

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: file.size,
        type,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !isGenerating;

  return (
    <div className={`w-full ${compact ? 'mx-0 px-0' : 'max-w-3xl mx-auto px-4 pb-3 sm:pb-5'}`}>
      <div className={`relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 ${compact ? 'rounded-xl' : 'rounded-xl'} shadow-md focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 overflow-hidden`}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {attachments.map((att) => (
              <FilePreview key={att.id} attachment={att} onRemove={removeAttachment} />
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2 p-2.5">
          <Tooltip content="Attach document or image">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </Tooltip>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 bg-transparent border-0 outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed py-1 px-1 ${compact ? 'min-h-[32px] text-sm' : 'min-h-[36px] text-sm'}`}
          />

          {/* Send or Stop Action */}
          {isGenerating ? (
            <Tooltip content="Stop response generation">
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                aria-label="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Send message">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSend}
                className={`p-2 rounded-lg transition-all duration-150 shrink-0 ${
                  canSend
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {!compact && (
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
          AI-generated responses may not always be accurate.
        </p>
      )}
    </div>
  );
};
