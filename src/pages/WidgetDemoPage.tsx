import React from 'react';
import { CompactChatWidget } from '../components/chat/CompactChatWidget';

export const WidgetDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
            Company website preview
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Embedded AI Assistant</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            This demo page represents a normal website experience where the compact AI assistant can open from a floating button and later expand into the full-screen assistant without losing the conversation.
          </p>
        </div>
      </div>

      <CompactChatWidget />
    </div>
  );
};
