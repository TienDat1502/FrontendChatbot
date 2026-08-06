import { useEffect, useRef, useState, useCallback } from 'react';

interface UseChatScrollOptions {
  threshold?: number;
  dependencies?: any[];
}

export function useChatScroll({ threshold = 120, dependencies = [] }: UseChatScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isAutoScrollEnabledRef = useRef(true);

  const checkIfNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom <= threshold;
  }, [threshold]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const nearBottom = checkIfNearBottom();
    isAutoScrollEnabledRef.current = nearBottom;
    setShowScrollToBottom(!nearBottom);
  }, [checkIfNearBottom]);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setShowScrollToBottom(false);
    isAutoScrollEnabledRef.current = true;
  }, []);

  // Auto-scroll on dependency updates if user is near bottom
  useEffect(() => {
    if (isAutoScrollEnabledRef.current) {
      scrollToBottom(false);
    }
  }, [...dependencies, scrollToBottom]);

  return {
    containerRef,
    showScrollToBottom,
    scrollToBottom,
    handleScroll,
  };
}
