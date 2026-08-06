export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error';

export type AttachmentType = 'image' | 'pdf' | 'document';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: AttachmentType;
  url?: string;
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface ChartSpec {
  type: ChartType;
  title: string;
  data: Record<string, string | number>[];
  xKey: string;
  series: ChartSeries[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  attachments?: Attachment[];
  chart?: ChartSpec;
}

export interface StreamingMessageState {
  content: string;
  chart?: ChartSpec;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

export type DateGroupLabel = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Previous 30 Days' | 'Older';

export interface GroupedConversations {
  label: DateGroupLabel;
  conversations: Conversation[];
}
