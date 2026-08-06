import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { conversationService } from '../services/conversationService';
import { simulateAiResponseStream } from '../services/aiService';
import { ChatHeader } from '../components/chat/ChatHeader';
import { WelcomeState } from '../components/chat/WelcomeState';
import { PromptComposer } from '../components/chat/PromptComposer';
import type { Attachment, StreamingMessageState } from '../types/chat';
import { useUiStore } from '../stores/useUiStore';

export const NewChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setCompactChatOpen, setReturnToRoute, returnToRoute } = useUiStore();
  const [streamingState, setStreamingState] = useState<Record<string, StreamingMessageState>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const createAndSendMutation = useMutation({
    mutationFn: async ({ prompt, attachments }: { prompt: string; attachments: Attachment[] }) => {
      // Create new conversation
      const newConv = await conversationService.createConversation('New Chat');
      
      // Add user message
      await conversationService.addMessage({
        conversationId: newConv.id,
        role: 'user',
        content: prompt,
        status: 'done',
        attachments,
      });

      // Prepare initial assistant streaming message
      const assistantMsg = await conversationService.addMessage({
        conversationId: newConv.id,
        role: 'assistant',
        content: '',
        status: 'streaming',
      });
      setStreamingState((prev) => ({
        ...prev,
        [assistantMsg.id]: { content: '', chart: undefined, status: 'streaming' },
      }));

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsGenerating(true);

      try {
        const result = await simulateAiResponseStream(
          prompt,
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

        await conversationService.updateMessage(assistantMsg.id, newConv.id, {
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
        if (error?.message === 'Generation aborted by user') {
          await conversationService.updateMessage(assistantMsg.id, newConv.id, {
            content: streamingState[assistantMsg.id]?.content || '',
            chart: streamingState[assistantMsg.id]?.chart,
            status: 'done',
          });
        } else {
          await conversationService.updateMessage(assistantMsg.id, newConv.id, {
            content: streamingState[assistantMsg.id]?.content || '',
            chart: streamingState[assistantMsg.id]?.chart,
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
        queryClient.invalidateQueries({ queryKey: ['messages', newConv.id] });
      }

      return newConv;
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/chat/${newConv.id}`);
    },
  });

  const handleSendPrompt = (prompt: string, attachments: Attachment[]) => {
    createAndSendMutation.mutate({ prompt, attachments });
  };

  const handleSelectSuggestion = (suggestionPrompt: string) => {
    handleSendPrompt(suggestionPrompt, []);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader
        title="New Chat"
        onNewChat={() => {}}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />

      <div className="flex-1 overflow-y-auto flex flex-col justify-between">
        <WelcomeState onSelectSuggestion={handleSelectSuggestion} />
        <PromptComposer
          onSend={handleSendPrompt}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
        />
      </div>
    </div>
  );
};
