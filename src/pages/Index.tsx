import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import type { ModelType } from '@/types/chat';

const Index = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const newConversation = await createConversation('gpt-5');
    if (newConversation) {
      setSelectedConversationId(newConversation.id);
      setSidebarOpen(false);
    }
  }, [createConversation]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  }, []);

  const handleRenameConversation = useCallback((id: string, title: string) => {
    updateConversation(id, { title });
  }, [updateConversation]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setSelectedConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [deleteConversation, conversations, selectedConversationId]);

  const handleModelChange = useCallback((model: ModelType) => {
    if (selectedConversationId) {
      updateConversation(selectedConversationId, { model });
    }
  }, [selectedConversationId, updateConversation]);

  const handleSendMessage = useCallback((content: string) => {
    if (selectedConversation) {
      sendMessage(content, selectedConversation.model);
      
      // Auto-rename conversation with first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        updateConversation(selectedConversation.id, { title });
      }
    }
  }, [selectedConversation, sendMessage, messages.length, updateConversation]);

  return (
    <div className="h-screen flex bg-background dark overflow-hidden">
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
      
      <main className="flex-1 flex flex-col min-w-0">
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
      </main>
    </div>
  );
};

export default Index;
