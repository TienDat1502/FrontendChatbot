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
import * as XLSX from 'xlsx';

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
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-slate-700 dark:text-slate-300 px-4 py-3 my-4 rounded-r-xl shadow-sm text-sm leading-relaxed">
                          {children}
                        </blockquote>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return <thead className="bg-slate-50 dark:bg-slate-800/40">{children}</thead>;
                    },
                    th({ children }) {
                      return <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 tracking-wide whitespace-nowrap">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-4 py-3 text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap">{children}</td>;
                    },
                    img({ src, alt, ...props }) {
                      if (src?.startsWith('https://chat-image.local/')) {
                        const imageId = src.replace('https://chat-image.local/', '');
                        // @ts-ignore
                        const base64 = typeof window !== 'undefined' && window.__CHAT_FILES ? window.__CHAT_FILES[imageId] : null;
                        
                        if (base64) {
                          let mimeType = 'image/png';
                          if (base64.startsWith('/9j/')) mimeType = 'image/jpeg';
                          else if (base64.startsWith('iVBORw')) mimeType = 'image/png';
                          else if (base64.startsWith('R0lG')) mimeType = 'image/gif';
                          else if (base64.startsWith('UklG')) mimeType = 'image/webp';
                          const handleDownload = (e: React.MouseEvent) => {
                            e.preventDefault();
                            try {
                              const byteCharacters = atob(base64);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], {type: mimeType});
                              
                              const blobUrl = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              const ext = mimeType.split('/')[1] || 'png';
                              a.download = `hinh_anh_${imageId}.${ext}`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(blobUrl);
                            } catch (err) {
                              console.error('Lỗi khi tải ảnh:', err);
                              alert('Có lỗi xảy ra khi tải ảnh.');
                            }
                          };
                          
                          return (
                            <div className="relative inline-block group my-2">
                              <img src={`data:${mimeType};base64,${base64}`} alt={alt || 'Hình ảnh'} className="max-w-full h-auto rounded-lg shadow-sm max-h-64 object-contain" />
                              <button
                                onClick={handleDownload}
                                className="absolute top-2 right-2 p-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm"
                                title="Tải ảnh xuống"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                              </button>
                            </div>
                          );
                        }
                      }
                      return <img src={src} alt={alt} className="max-w-full h-auto rounded-lg shadow-sm my-2 inline-block" {...props} />;
                    },
                    a({ href, children, ...props }) {
                      if (href?.startsWith('https://chat-file.local/') || href?.startsWith('https://chat-csv.local/')) {
                        const isCsv = href.startsWith('https://chat-csv.local/');
                        const fileId = href.replace(isCsv ? 'https://chat-csv.local/' : 'https://chat-file.local/', '');
                        
                        const handleDownload = (e: React.MouseEvent) => {
                          e.preventDefault();
                          // @ts-ignore
                          const fileData = typeof window !== 'undefined' && window.__CHAT_FILES ? window.__CHAT_FILES[fileId] : null;
                          if (!fileData) {
                            alert('Không tìm thấy dữ liệu. Vui lòng tải lại trang.');
                            return;
                          }
                          
                          try {
                            let blobUrl: string;
                            if (isCsv) {
                              // Tạo Workbook và Worksheet từ mảng dữ liệu (AoA)
                              const wb = XLSX.utils.book_new();
                              const ws = XLSX.utils.aoa_to_sheet(fileData);
                              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                              
                              const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                              const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                              
                              blobUrl = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              a.download = `Bang_du_lieu.xlsx`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            } else {
                              const byteCharacters = atob(fileData);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], {type: 'application/pdf'});
                              
                              blobUrl = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              a.download = String(children).replace('Tải xuống ', '');
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }
                            URL.revokeObjectURL(blobUrl);
                          } catch (err) {
                            console.error("Lỗi khi tải file:", err);
                            alert("Đã xảy ra lỗi khi tạo file.");
                          }
                        };
                        
                        return (
                          <a 
                            href="#" 
                            onClick={handleDownload} 
                            className={`inline-flex items-center gap-1.5 px-3 py-2 my-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-colors font-medium border border-slate-200 dark:border-slate-700 no-underline ${
                              isCsv ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-700" : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            {isCsv ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            )}
                            {isCsv ? children : `Tải xuống ${children}`}
                          </a>
                        );
                      }
                      return <a href={href} className="text-blue-600 hover:underline" {...props}>{children}</a>;
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
