import type { Conversation, GroupedConversations, DateGroupLabel } from '../types/chat';

export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysAgo = todayStart - 86400000 * 6;
  const thirtyDaysAgo = todayStart - 86400000 * 29;

  const groups: Record<DateGroupLabel, Conversation[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  };

  conversations.forEach((conv) => {
    const time = new Date(conv.updatedAt || conv.createdAt).getTime();

    if (time >= todayStart) {
      groups.Today.push(conv);
    } else if (time >= yesterdayStart) {
      groups.Yesterday.push(conv);
    } else if (time >= sevenDaysAgo) {
      groups['Previous 7 Days'].push(conv);
    } else if (time >= thirtyDaysAgo) {
      groups['Previous 30 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  const order: DateGroupLabel[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];

  return order
    .filter((label) => groups[label].length > 0)
    .map((label) => ({
      label,
      conversations: groups[label],
    }));
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
