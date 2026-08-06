import { useEffect, useRef, useState } from 'react';

interface UseStreamingTextOptions {
  content: string;
  isStreaming: boolean;
  speed?: number;
  reducedMotion?: boolean;
}

export function useStreamingText({
  content,
  isStreaming,
  speed = 1,
  reducedMotion = false,
}: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState(content);
  const [isAnimating, setIsAnimating] = useState(false);

  const displayedRef = useRef(content);
  const pendingRef = useRef('');
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    displayedRef.current = displayedText;
  }, [displayedText]);

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (!isStreaming) {
      if (content !== displayedRef.current) {
        displayedRef.current = content;
        setDisplayedText(content);
      }
      pendingRef.current = '';
      setIsAnimating(false);
      return;
    }

    if (content.length < displayedRef.current.length) {
      displayedRef.current = content;
      setDisplayedText(content);
      pendingRef.current = '';
      setIsAnimating(false);
      return;
    }

    const delta = content.slice(displayedRef.current.length);
    if (delta) {
      pendingRef.current += delta;
    }

    if (reducedMotion) {
      if (pendingRef.current.length > 0) {
        displayedRef.current = content;
        setDisplayedText(content);
        pendingRef.current = '';
        setIsAnimating(false);
      }
      return;
    }

    if (!pendingRef.current) {
      setIsAnimating(false);
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      const revealRatio = Math.min(3.2, 1 + speed * 0.8);
      const baseChars = Math.max(1, Math.ceil((elapsed / 95) * revealRatio));
      const charsToReveal = Math.min(pendingRef.current.length, baseChars);

      if (charsToReveal > 0) {
        const nextChunk = pendingRef.current.slice(0, charsToReveal);
        pendingRef.current = pendingRef.current.slice(charsToReveal);
        displayedRef.current += nextChunk;
        setDisplayedText(displayedRef.current);
        setIsAnimating(true);
      }

      if (pendingRef.current.length > 0) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
    };
  }, [content, isStreaming, reducedMotion, speed]);

  return {
    displayedText,
    isAnimating,
  };
}
