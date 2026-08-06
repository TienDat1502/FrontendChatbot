import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Bot, User, AlertCircle } from 'lucide-react';
import type { Message, StreamingMessageState } from '../../types/chat';
import { CodeBlock } from './CodeBlock';
import { ChatChart } from '../charts/ChatChart';
import { Tooltip } from '../ui/Tooltip';
import { FilePreview } from '../ui/FilePreview';
import { useStreamingText } from '../../hooks/useStreamingText';

interface ChatMessageItemProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  isLastAssistant?: boolean;
  streamingState?: StreamingMessageState;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  isLastAssistant,
  streamingState,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming' || streamingState?.status === 'streaming';
  const contentSource = useMemo(() => {
    if (streamingState && (message.role === 'assistant' || message.role === 'system')) {
      return streamingState.content;
    }
    return message.content;
  }, [message.content, message.role, streamingState]);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { displayedText, isAnimating } = useStreamingText({
    content: contentSource,
    isStreaming,
    speed: isUser ? 0.5 : 1.2,
    reducedMotion,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/50'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3.5">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-medium shadow-xs">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
          </div>

          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-0.5">
              {message.attachments.map((att) => (
                <FilePreview key={att.id} attachment={att} onRemove={() => {}} />
              ))}
            </div>
          )}

          {/* Message Content */}
          <div className={`markdown-content text-sm text-slate-800 dark:text-slate-200 leading-relaxed overflow-hidden ${
            isUser ? 'inline-block bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tl-none font-normal shadow-2xs' : ''
          }`}>
            {message.status === 'error' ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Failed to generate response. Please try again.</span>
              </div>
            ) : (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className={`px-1.5 py-0.5 rounded font-mono text-xs font-medium ${
                              isUser
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                            }`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : undefined}
                          value={codeString}
                        />
                      );
                    },
                  }}
                >
                  {displayedText}
                </ReactMarkdown>
                {!isUser && isStreaming && (
                  <span
                    aria-hidden="true"
                    className={`ml-1 inline-block h-4 w-[1px] align-middle bg-slate-500/70 transition-opacity ${isAnimating ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
                  />
                )}
              </>
            )}
          </div>

          {/* Recharts Chart Component */}
          {(streamingState?.chart || message.chart) && <ChatChart spec={streamingState?.chart || message.chart!} />}

          {/* Streaming Indicator */}
          {isStreaming && !isUser && (
            <div className="flex items-center gap-1.5 pt-1 text-blue-600 dark:text-blue-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="font-medium">Generating response…</span>
            </div>
          )}

          {/* Message Actions */}
          {!isUser && message.status === 'done' && (
            <div className="flex items-center gap-1 pt-1.5 text-slate-400">
              <Tooltip content="Copy response">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  aria-label="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>

              <Tooltip content="Helpful">
                <button
                  type="button"
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    liked === true ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                  aria-label="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Not helpful">
                <button
                  type="button"
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    liked === false ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                  aria-label="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {isLastAssistant && onRegenerate && (
                <Tooltip content="Regenerate response">
                  <button
                    type="button"
                    onClick={() => onRegenerate(message.id)}
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
                    aria-label="Regenerate response"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
