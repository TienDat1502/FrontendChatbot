import { useEffect, useRef } from 'react';

export function useAutoResizeTextarea(value: string, maxHeight: number = 200) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const nextHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;

    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [value, maxHeight]);

  return textareaRef;
}
