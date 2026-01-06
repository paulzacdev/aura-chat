import { useState, useCallback, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Background3D } from '@/components/3d/Background3D';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import type { ModelType } from '@/types/chat';

export default function Chat() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    streaming,
    error,
    sendMessage,
  } = useMessages(selectedConversationId);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  // Auto-select first conversation on load
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, conversationsLoading, selectedConversationId]);

  const handleNewConversation = useCallback(async () => {
    const newConversation = await createConversation();
    if (newConversation) {
      setSelectedConversationId(newConversation.id);
    }
  }, [createConversation]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const handleRenameConversation = useCallback(async (id: string, title: string) => {
    await updateConversation(id, { title });
  }, [updateConversation]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    await deleteConversation(id);
    if (selectedConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setSelectedConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [deleteConversation, selectedConversationId, conversations]);

  const handleModelChange = useCallback(async (model: ModelType) => {
    if (selectedConversationId) {
      await updateConversation(selectedConversationId, { model });
    }
  }, [selectedConversationId, updateConversation]);

  const handleSendMessage = useCallback(async (content: string) => {
    const model = selectedConversation?.model as ModelType || 'gpt-5';
    if (!selectedConversationId) {
      // Create new conversation if none selected
      const newConversation = await createConversation();
      if (newConversation) {
        setSelectedConversationId(newConversation.id);
        await sendMessage(content, model);
      }
    } else {
      await sendMessage(content, model);
    }
  }, [selectedConversationId, selectedConversation, createConversation, sendMessage]);

  return (
    <div className="h-screen flex overflow-hidden bg-background relative">
      <Suspense fallback={null}>
        <Background3D />
      </Suspense>
      
      <Sidebar
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={handleSelectConversation}
        onCreate={handleNewConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        loading={messagesLoading}
        streaming={streaming}
        error={error}
        onSendMessage={handleSendMessage}
        onModelChange={handleModelChange}
        onNewConversation={handleNewConversation}
      />
    </div>
  );
}