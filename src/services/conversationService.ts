import type { Conversation, Message, ChartSpec } from '../types/chat';

const STORAGE_KEY_CONVERSATIONS = 'ai_assistant_conversations';
const STORAGE_KEY_MESSAGES = 'ai_assistant_messages';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-sample-1',
    title: 'Product Overview & Performance Metrics',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'conv-sample-2',
    title: 'Technical Integration & SDK Guide',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'conv-sample-3',
    title: 'Frequently Asked Questions & Support',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

const SAMPLE_CHART: ChartSpec = {
  type: 'bar',
  title: 'Service Adoption & Satisfaction Rates',
  xKey: 'category',
  data: [
    { category: 'Enterprise', adoption: 88, satisfaction: 94 },
    { category: 'Professional', adoption: 76, satisfaction: 91 },
    { category: 'Standard', adoption: 65, satisfaction: 89 },
    { category: 'Starter', adoption: 50, satisfaction: 85 },
  ],
  series: [
    { dataKey: 'adoption', name: 'Adoption Rate (%)', color: '#2563eb' },
    { dataKey: 'satisfaction', name: 'Satisfaction Score', color: '#059669' },
  ],
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-sample-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-sample-1',
      role: 'user',
      content: 'Can you show me an overview of our product adoption and customer satisfaction metrics?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'done',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-sample-1',
      role: 'assistant',
      content: `Welcome! Here is the latest summary of **product adoption and customer satisfaction** across our service tiers.

### Key Highlights:
- **Enterprise tier**: High satisfaction at **94%** with an **88%** adoption rate.
- **Professional tier**: Strong growth and steady customer feedback.
- **Overall trend**: Positive retention rates across all segments.

Below is the comparison chart for your review:`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 2).toISOString(),
      status: 'done',
      chart: SAMPLE_CHART,
    },
  ],
  'conv-sample-2': [
    {
      id: 'msg-3',
      conversationId: 'conv-sample-2',
      role: 'user',
      content: 'How do I initialize the client SDK in TypeScript?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      status: 'done',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-sample-2',
      role: 'assistant',
      content: `Here is a standard example for initializing the SDK in your project:

\`\`\`typescript
import { createClient } from '@company/assistant-sdk';

const client = createClient({
  apiKey: process.env.ASSISTANT_API_KEY,
  environment: 'production',
});

async function main() {
  const response = await client.query({
    message: 'Hello, how can I get started?',
  });
  console.log('Assistant response:', response.text);
}

main();
\`\`\`

### Next Steps:
1. Store your API Key securely in environment variables.
2. Handle network status gracefully in your application layer.`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26 + 1000 * 3).toISOString(),
      status: 'done',
    },
  ],
  'conv-sample-3': [
    {
      id: 'msg-5',
      conversationId: 'conv-sample-3',
      role: 'user',
      content: 'Where can I find support documentation and response times?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      status: 'done',
    },
    {
      id: 'msg-6',
      conversationId: 'conv-sample-3',
      role: 'assistant',
      content: `### Support & Service Level Agreement (SLA)

| Support Tier | Response Time | Available Hours |
| --- | --- | --- |
| **Standard Support** | Within 24 hours | Business Hours |
| **Priority Support** | Within 4 hours | 24/7 |
| **Enterprise SLA** | Under 1 hour | Dedicated Account Manager |

> Our support team is dedicated to providing quick, reliable answers. Let me know if you need assistance with a specific topic!`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 2).toISOString(),
      status: 'done',
    },
  ],
};

export interface IConversationService {
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  createConversation(title?: string): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  getMessages(conversationId: string): Promise<Message[]>;
  addMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;
  updateMessage(id: string, conversationId: string, updates: Partial<Message>): Promise<Message>;
  deleteMessage(id: string, conversationId: string): Promise<void>;
}

class MockConversationService implements IConversationService {
  private loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
        return INITIAL_CONVERSATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  }

  private saveConversations(convs: Conversation[]): void {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
  }

  private loadMessages(): Record<string, Message[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
        return INITIAL_MESSAGES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  private saveMessages(messages: Record<string, Message[]>): void {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }

  async getConversations(): Promise<Conversation[]> {
    await new Promise((res) => setTimeout(res, 50));
    const convs = this.loadConversations();
    return convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getConversation(id: string): Promise<Conversation | null> {
    await new Promise((res) => setTimeout(res, 30));
    const convs = this.loadConversations();
    return convs.find((c) => c.id === id) || null;
  }

  async createConversation(title: string = 'New Conversation'): Promise<Conversation> {
    const convs = this.loadConversations();
    const newConv: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    convs.unshift(newConv);
    this.saveConversations(convs);

    const msgsMap = this.loadMessages();
    msgsMap[newConv.id] = [];
    this.saveMessages(msgsMap);

    return newConv;
  }

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const convs = this.loadConversations();
    const idx = convs.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Conversation not found');

    convs[idx] = { ...convs[idx], title, updatedAt: new Date().toISOString() };
    this.saveConversations(convs);
    return convs[idx];
  }

  async deleteConversation(id: string): Promise<void> {
    let convs = this.loadConversations();
    convs = convs.filter((c) => c.id !== id);
    this.saveConversations(convs);

    const msgsMap = this.loadMessages();
    delete msgsMap[id];
    this.saveMessages(msgsMap);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((res) => setTimeout(res, 30));
    const msgsMap = this.loadMessages();
    return msgsMap[conversationId] || [];
  }

  async addMessage(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const msgsMap = this.loadMessages();
    const list = msgsMap[message.conversationId] || [];

    const newMsg: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    list.push(newMsg);
    msgsMap[message.conversationId] = list;
    this.saveMessages(msgsMap);

    // Update conversation updatedAt
    const convs = this.loadConversations();
    const convIdx = convs.findIndex((c) => c.id === message.conversationId);
    if (convIdx !== -1) {
      let updatedTitle = convs[convIdx].title;
      if (list.length === 1 && message.role === 'user' && (updatedTitle === 'New Conversation' || updatedTitle === 'New Chat')) {
        updatedTitle = message.content.slice(0, 32) + (message.content.length > 32 ? '...' : '');
      }

      convs[convIdx] = {
        ...convs[convIdx],
        title: updatedTitle,
        updatedAt: new Date().toISOString(),
      };
      this.saveConversations(convs);
    }

    return newMsg;
  }

  async updateMessage(id: string, conversationId: string, updates: Partial<Message>): Promise<Message> {
    const msgsMap = this.loadMessages();
    const list = msgsMap[conversationId] || [];
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Message not found');

    list[idx] = { ...list[idx], ...updates };
    msgsMap[conversationId] = list;
    this.saveMessages(msgsMap);
    return list[idx];
  }

  async deleteMessage(id: string, conversationId: string): Promise<void> {
    const msgsMap = this.loadMessages();
    let list = msgsMap[conversationId] || [];
    list = list.filter((m) => m.id !== id);
    msgsMap[conversationId] = list;
    this.saveMessages(msgsMap);
  }
}

export const conversationService: IConversationService = new MockConversationService();
