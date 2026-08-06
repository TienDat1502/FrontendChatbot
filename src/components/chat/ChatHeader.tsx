import React from 'react';
import { Menu, Plus, Moon, Sun, Monitor, PanelLeftOpen, PanelLeftClose, Bot, Minimize2, X } from 'lucide-react';
import { useUiStore } from '../../stores/useUiStore';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  title?: string;
  onNewChat?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title = 'AI Assistant', onNewChat, onMinimize, onClose }) => {
  const navigate = useNavigate();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    toggleMobileDrawer,
    theme,
    setTheme,
    openModal,
  } = useUiStore();

  const handleNextTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'dark':
        return <Moon className="w-4 h-4 text-blue-400" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Drawer Button */}
        <button
          type="button"
          onClick={toggleMobileDrawer}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 items-center justify-center border border-blue-200 dark:border-blue-900/50">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-xs">
                {title}
              </h2>
              {/* Ready to Help Status Badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready to help
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onMinimize ? (
          <Tooltip content="Minimize">
            <button
              type="button"
              onClick={onMinimize}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Minimize AI Assistant"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </Tooltip>
        ) : null}

        {onClose ? (
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        ) : null}

        {/* Single Primary New Conversation Action */}
        <Tooltip content="Start new conversation">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onNewChat) onNewChat();
              else navigate('/');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline font-medium">New Conversation</span>
          </Button>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip content={`Theme: ${theme}`}>
          <button
            type="button"
            onClick={handleNextTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </button>
        </Tooltip>

        {/* Settings Launcher */}
        <Tooltip content="Settings">
          <button
            type="button"
            onClick={() => openModal('settings')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <Bot className="w-4 h-4 text-slate-400" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
