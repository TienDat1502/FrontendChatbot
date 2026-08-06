import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Maximize2, Minus, Sparkles, X } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { simulateAiResponseStream } from '../../services/aiService';
import { ChatMessagesList } from './ChatMessagesList';
import { PromptComposer } from './PromptComposer';
import { useUiStore } from '../../stores/useUiStore';
import type { Attachment, StreamingMessageState } from '../../types/chat';

const QUICK_ACTIONS = [
  'Tell me about your products and services.',
  'Help me find the information I need.',
  'Show me answers to frequently asked questions.',
  'I need help with something.',
];

export const CompactChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingState, setStreamingState] = useState<Record<string, StreamingMessageState>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    isCompactChatOpen,
    isCompactChatMinimized,
    setCompactChatOpen,
    setCompactChatMinimized,
    activeConversationId,
    setActiveConversationId,
    setReturnToRoute,
  } = useUiStore();

  const isFullScreenRoute = location.pathname.startsWith('/chat/');
  const isWidgetRoute = location.pathname === '/widget-demo';

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)/);
    if (match?.[1]) {
      setActiveConversationId(match[1]);
    } else if (location.pathname === '/') {
      setActiveConversationId(activeConversationId ?? null);
    }
  }, [activeConversationId, location.pathname, setActiveConversationId]);

  const enabledConversationId = activeConversationId ?? undefined;

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', enabledConversationId],
    queryFn: () => (enabledConversationId ? conversationService.getMessages(enabledConversationId) : []),
    enabled: !!enabledConversationId,
  });

  const sendMutation = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments: Attachment[] }) => {
      let conversationId = activeConversationId;

      if (!conversationId) {
        const newConversation = await conversationService.createConversation('New Chat');
        conversationId = newConversation.id;
        setActiveConversationId(newConversation.id);
      }

      if (!conversationId) return;

      await conversationService.addMessage({
        conversationId,
        role: 'user',
        content,
        status: 'done',
        attachments,
      });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const assistantMsg = await conversationService.addMessage({
        conversationId,
        role: 'assistant',
        content: '',
        status: 'streaming',
      });

      setStreamingState((prev) => ({
        ...prev,
        [assistantMsg.id]: { content: '', chart: undefined, status: 'streaming' },
      }));
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsGenerating(true);

      try {
        const result = await simulateAiResponseStream(
          content,
          (_chunk, fullText, chart) => {
            setStreamingState((prev) => ({
              ...prev,
              [assistantMsg.id]: {
                content: fullText,
                chart: chart || undefined,
                status: 'streaming',
              },
            }));
          },
          controller.signal
        );

        await conversationService.updateMessage(assistantMsg.id, conversationId, {
          content: result.content,
          chart: result.chart,
          status: 'done',
        });
        setStreamingState((prev) => {
          const next = { ...prev };
          delete next[assistantMsg.id];
          return next;
        });
      } catch (error: any) {
        const currentState = streamingState[assistantMsg.id];
        if (error?.message === 'Generation aborted by user') {
          await conversationService.updateMessage(assistantMsg.id, conversationId, {
            content: currentState?.content || '',
            chart: currentState?.chart,
            status: 'done',
          });
        } else {
          await conversationService.updateMessage(assistantMsg.id, conversationId, {
            content: currentState?.content || '',
            chart: currentState?.chart,
            status: 'error',
          });
        }
        setStreamingState((prev) => {
          const next = { ...prev };
          delete next[assistantMsg.id];
          return next;
        });
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const handleSendPrompt = (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;
    sendMutation.mutate({ content, attachments });
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const handleExpand = () => {
    const returnRoute = `${location.pathname}${location.search}${location.hash}` || '/widget-demo';
    setReturnToRoute(returnRoute);

    if (!activeConversationId) {
      const nextConversationId = messages[0]?.conversationId;
      if (nextConversationId) {
        setActiveConversationId(nextConversationId);
        navigate(`/chat/${nextConversationId}`, { state: { returnTo: returnRoute } });
        return;
      }
    }

    if (activeConversationId) {
      navigate(`/chat/${activeConversationId}`, { state: { returnTo: returnRoute } });
      return;
    }

    navigate('/');
  };

  const handleQuickAction = (prompt: string) => {
    handleSendPrompt(prompt, []);
  };

  const panelClassName = useMemo(() => {
    const base = 'fixed bottom-4 right-4 z-40 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/95';
    const motionPref = reducedMotion ? '' : 'transition-all duration-200';
    return `${base} ${motionPref}`;
  }, [reducedMotion]);

  if (isFullScreenRoute || !isWidgetRoute) {
    return null;
  }

  if (!isCompactChatOpen) {
    return (
      <button
        type="button"
        onClick={() => setCompactChatOpen(true)}
        aria-label="Open AI Assistant"
        className={`fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-12px_rgba(15,23,42,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${reducedMotion ? '' : 'active:scale-95'}`}
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  if (isCompactChatMinimized) {
    return (
      <button
        type="button"
        onClick={() => setCompactChatMinimized(false)}
        aria-label="Restore AI Assistant"
        className={`fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-12px_rgba(15,23,42,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 ${reducedMotion ? '' : 'active:scale-95'}`}
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`${panelClassName} w-[min(92vw,420px)] max-w-[420px] max-h-[min(80dvh,680px)] min-h-[360px] sm:w-[390px] sm:max-h-[min(84dvh,680px)]`}>
      <header className="flex items-center justify-between border-b border-slate-200/70 px-3.5 py-2.5 dark:border-slate-800/70">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready to help
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Compact assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExpand}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Expand to full screen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCompactChatMinimized(!isCompactChatMinimized)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={isCompactChatMinimized ? 'Restore chat' : 'Minimize chat'}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCompactChatOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {!isCompactChatMinimized ? (
        <>
          <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/70 dark:bg-slate-900/50">
            {messages.length === 0 && !isGenerating ? (
              <div className="flex h-full flex-col justify-between p-4">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Hello! 👋 How can I help you today?
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => handleQuickAction(action)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-400"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ChatMessagesList
                messages={messages}
                isLoading={isLoadingMessages}
                streamingState={streamingState}
              />
            )}
          </div>

          <div className="border-t border-slate-200/70 bg-white/90 px-2.5 py-2.5 dark:border-slate-800/70 dark:bg-slate-950/90">
            <PromptComposer
              onSend={handleSendPrompt}
              isGenerating={isGenerating}
              onStopGeneration={handleStopGeneration}
              compact
              placeholder="Type your message..."
            />
          </div>
        </>
      ) : null}
    </div>
  );
};
