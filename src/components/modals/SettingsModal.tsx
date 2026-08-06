import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUiStore } from '../../stores/useUiStore';
import type { Theme } from '../../types/chat';
import { Sun, Moon, Monitor, Trash2 } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { activeModal, closeModal, theme, setTheme } = useUiStore();

  if (activeModal !== 'settings') return null;

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4 text-slate-400" /> },
  ];

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to reset stored assistant conversation data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Assistant Settings">
      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Appearance Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  theme === opt.value
                    ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear Local Data */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Reset Saved Data</p>
            <p className="text-[11px] text-slate-500">Restores default assistant topics</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAllData} className="text-xs text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="primary" size="sm" onClick={closeModal}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
