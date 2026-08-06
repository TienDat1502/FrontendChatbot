import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversationService';
import { Sidebar } from '../components/sidebar/Sidebar';
import { RenameDialog } from '../components/modals/RenameDialog';
import { DeleteConfirmDialog } from '../components/modals/DeleteConfirmDialog';
import { SettingsModal } from '../components/modals/SettingsModal';
import { CompactChatWidget } from '../components/chat/CompactChatWidget';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.getConversations(),
  });

  // Create conversation mutation
  const createMutation = useMutation({
    mutationFn: (title?: string) => conversationService.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate(`/chat/${newConv.id}`);
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationService.renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/');
    },
  });

  const handleNewChat = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#212121] text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Component */}
      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        isLoading={isLoading}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Outlet context={{ conversations, createMutation }} />
      </main>

      {/* Global Modals */}
      <RenameDialog onRename={async (id, title) => { await renameMutation.mutateAsync({ id, title }); }} />
      <DeleteConfirmDialog onDelete={(id) => deleteMutation.mutateAsync(id)} />
      <SettingsModal />
      <CompactChatWidget />
    </div>
  );
};
