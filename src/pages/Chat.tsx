import { useState, useCallback, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Background3D } from '@/components/3d/Background3D';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

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

  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedConversationId) {
      // Create new conversation if none selected
      const newConversation = await createConversation();
      if (newConversation) {
        setSelectedConversationId(newConversation.id);
        await sendMessage(content, 'google/gemini-2.5-flash');
      }
    } else {
      await sendMessage(content, 'google/gemini-2.5-flash');
    }
  }, [selectedConversationId, createConversation, sendMessage]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
        onNewConversation={handleNewConversation}
      />
    </div>
  );
}