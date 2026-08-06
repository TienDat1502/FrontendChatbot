import React, { useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversationService';
import { simulateAiResponseStream } from '../services/aiService';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatMessagesList } from '../components/chat/ChatMessagesList';
import { PromptComposer } from '../components/chat/PromptComposer';
import type { Attachment, StreamingMessageState } from '../types/chat';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../stores/useUiStore';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setCompactChatOpen, setReturnToRoute, returnToRoute } = useUiStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingState, setStreamingState] = useState<Record<string, StreamingMessageState>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch Conversation detail
  const { data: conversation, isLoading: isLoadingConv } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => (conversationId ? conversationService.getConversation(conversationId) : null),
    enabled: !!conversationId,
  });

  // Fetch Messages for conversation
  const { data: messages = [], isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => (conversationId ? conversationService.getMessages(conversationId) : []),
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments: Attachment[] }) => {
      if (!conversationId) return;

      // 1. User message
      await conversationService.addMessage({
        conversationId,
        role: 'user',
        content,
        status: 'done',
        attachments,
      });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // 2. Assistant placeholder
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

      // Prepare abort controller
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
      } catch (err: any) {
        const activeState = streamingState[assistantMsg.id];
        if (err?.message === 'Generation aborted by user') {
          await conversationService.updateMessage(assistantMsg.id, conversationId, {
            content: activeState?.content || '',
            chart: activeState?.chart,
            status: 'done',
          });
        } else {
          await conversationService.updateMessage(assistantMsg.id, conversationId, {
            content: activeState?.content || '',
            chart: activeState?.chart,
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

  // Regenerate message
  const handleRegenerate = async (assistantMsgId: string) => {
    if (!conversationId || isGenerating) return;

    const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
    let prompt = 'Hello';
    if (msgIndex > 0 && messages[msgIndex - 1].role === 'user') {
      prompt = messages[msgIndex - 1].content;
    }

    // Set message to streaming
    await conversationService.updateMessage(assistantMsgId, conversationId, {
      content: '',
      status: 'streaming',
      chart: undefined,
    });
    setStreamingState((prev) => ({
      ...prev,
      [assistantMsgId]: { content: '', chart: undefined, status: 'streaming' },
    }));
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);

    try {
      const result = await simulateAiResponseStream(
        prompt,
        (_chunk, fullText, chart) => {
          setStreamingState((prev) => ({
            ...prev,
            [assistantMsgId]: {
              content: fullText,
              chart: chart || undefined,
              status: 'streaming',
            },
          }));
        },
        controller.signal
      );

      await conversationService.updateMessage(assistantMsgId, conversationId, {
        content: result.content,
        chart: result.chart,
        status: 'done',
      });
      setStreamingState((prev) => {
        const next = { ...prev };
        delete next[assistantMsgId];
        return next;
      });
    } catch {
      const activeState = streamingState[assistantMsgId];
      await conversationService.updateMessage(assistantMsgId, conversationId, {
        content: activeState?.content || '',
        chart: activeState?.chart,
        status: 'error',
      });
      setStreamingState((prev) => {
        const next = { ...prev };
        delete next[assistantMsgId];
        return next;
      });
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resolveReturnRoute = () => {
    const stateReturnRoute = (location.state as { returnTo?: string } | null)?.returnTo;
    return stateReturnRoute || returnToRoute || '/widget-demo';
  };

  const handleMinimize = () => {
    const targetRoute = resolveReturnRoute();
    setReturnToRoute(targetRoute);
    setCompactChatOpen(true);
    navigate(targetRoute);
  };

  const handleClose = () => {
    const targetRoute = resolveReturnRoute();
    setReturnToRoute(targetRoute);
    setCompactChatOpen(false);
    navigate(targetRoute);
  };

  // Missing conversation handling (Graceful state)
  if (!isLoadingConv && !conversation) {
    return (
      <div className="flex-1 flex flex-col h-full items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Conversation Not Found
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mb-6">
          This conversation may have been deleted or the link is invalid.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          <Plus className="w-4 h-4" />
          <span>Start New Chat</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader
        title={conversation?.title || 'Chat'}
        onNewChat={() => navigate('/')}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />

      <div className="flex-1 flex flex-col min-h-0 justify-between">
        <ChatMessagesList
          messages={messages}
          onRegenerate={handleRegenerate}
          isLoading={isLoadingMsgs}
          streamingState={streamingState}
        />

        <PromptComposer
          onSend={(content, attachments) => sendMutation.mutate({ content, attachments })}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
        />
      </div>
    </div>
  );
};
