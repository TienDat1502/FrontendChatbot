import { create } from 'zustand';
import type { Theme } from '../types/chat';

interface UiState {
  // Sidebar states
  isSidebarCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;

  // Search filter query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Theme state
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Dialog/Modal states
  activeModal: 'settings' | 'deleteConfirm' | 'renameDialog' | null;
  activeModalData: any;
  openModal: (modal: 'settings' | 'deleteConfirm' | 'renameDialog', data?: any) => void;
  closeModal: () => void;

  // Compact chat widget state
  isCompactChatOpen: boolean;
  isCompactChatMinimized: boolean;
  activeConversationId: string | null;
  returnToRoute: string | null;
  setCompactChatOpen: (open: boolean) => void;
  setCompactChatMinimized: (minimized: boolean) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setReturnToRoute: (route: string | null) => void;
}

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('nova_theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
};

export const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;
  let isDark = false;

  if (theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = theme === 'dark';
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileDrawerOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem('nova_theme', theme);
    applyThemeToDocument(theme);
    set({ theme });
  },

  activeModal: null,
  activeModalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, activeModalData: data }),
  closeModal: () => set({ activeModal: null, activeModalData: null }),

  isCompactChatOpen: false,
  isCompactChatMinimized: false,
  activeConversationId: null,
  returnToRoute: null,
  setCompactChatOpen: (open) => set({ isCompactChatOpen: open, isCompactChatMinimized: open ? false : true }),
  setCompactChatMinimized: (minimized) => set({ isCompactChatMinimized: minimized }),
  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),
  setReturnToRoute: (route) => set({ returnToRoute: route }),
}));
