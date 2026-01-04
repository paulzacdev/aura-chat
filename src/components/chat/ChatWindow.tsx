import { useRef, useEffect } from 'react';
import { MessageSquarePlus, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import type { Message, Conversation, ModelType } from '@/types/chat';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onModelChange: (model: ModelType) => void;
  onNewConversation: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  loading,
  streaming,
  error,
  onSendMessage,
  onModelChange,
  onNewConversation,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Bienvenue !</h2>
            <p className="text-muted-foreground">
              Démarrez une nouvelle conversation pour discuter avec l'IA.
            </p>
          </div>
          <Button onClick={onNewConversation} size="lg" className="gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Nouvelle conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 ml-12 md:ml-0">
          <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
            {conversation.title}
          </h1>
        </div>
        <ModelSelector
          selectedModel={conversation.model}
          onSelect={onModelChange}
        />
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-3xl mx-auto divide-y divide-border/50">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Chargement des messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Bot className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Commencez la conversation en envoyant un message.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={streaming && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={loading}
        streaming={streaming}
      />
    </div>
  );
}
