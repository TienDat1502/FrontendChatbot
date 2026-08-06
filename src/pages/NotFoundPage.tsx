import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800 text-white flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">404</h1>
      <p className="text-sm text-zinc-500 mb-6">Page not found</p>
      <Button variant="primary" size="md" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </div>
  );
};
