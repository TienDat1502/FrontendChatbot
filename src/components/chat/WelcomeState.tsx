import React from 'react';
import { Bot, Compass, HelpCircle, Info, Search } from 'lucide-react';

interface WelcomeStateProps {
  onSelectSuggestion: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    title: 'Explore products & services',
    prompt: 'Tell me about your products and services.',
  },
  {
    icon: <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    title: 'Get information',
    prompt: 'Help me find the information I need.',
  },
  {
    icon: <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    title: 'Frequently asked questions',
    prompt: 'Show me answers to frequently asked questions.',
  },
  {
    icon: <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    title: 'Help & support',
    prompt: 'I need help with something.',
  },
];

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto animate-in fade-in duration-200">
      {/* Subdued AI Assistant Identity Badge */}
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center mb-4 shadow-2xs">
        <Bot className="w-6 h-6" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
        How can I help you today?
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        Ask a question or select a topic below to get started with the AI Assistant.
      </p>

      {/* Corporate Suggestion Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSuggestion(item.prompt)}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-150 shadow-2xs group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              "{item.prompt}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
