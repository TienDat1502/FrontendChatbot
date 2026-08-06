import React from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { useUiStore } from '../../stores/useUiStore';

export const UserSettingsSection: React.FC = () => {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <div className="p-3 border-t border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => openModal('settings')}
          className="flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        <button
          type="button"
          onClick={() => openModal('settings')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
