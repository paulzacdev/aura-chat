import { useRef, useEffect } from 'react';
import { MessageSquarePlus, Cross, Sparkles, BookOpen } from 'lucide-react';
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

// System welcome message for new conversations
const WELCOME_MESSAGE: Message = {
  id: 'welcome-system',
  conversation_id: '',
  role: 'system',
  content: `Bienvenue dans Théologia, votre assistant en théologie catholique. 🕊️

Pour mieux vous accompagner dans votre exploration de la foi, pourriez-vous m'indiquer votre niveau de connaissance du christianisme ?

• **Débutant** — Je découvre la foi catholique
• **Intermédiaire** — Je connais les bases et souhaite approfondir  
• **Avancé** — Je cherche des réponses théologiques approfondies

Indiquez votre niveau dans votre premier message, ou posez directement votre question.`,
  created_at: new Date().toISOString(),
};

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
        <div className="max-w-md text-center space-y-8">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
              <Cross className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-semibold text-foreground">Bienvenue sur Théologia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Votre assistant en théologie catholique, alimenté par l'intelligence artificielle pour vous aider à explorer et approfondir votre foi.
            </p>
          </div>
          <Button onClick={onNewConversation} size="lg" className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
            <MessageSquarePlus className="h-5 w-5" />
            Commencer une conversation
          </Button>
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary/60" />
            <span>Agent RAG externe — Interface sécurisée</span>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome message for empty conversations
  const displayMessages = messages.length === 0 && !loading 
    ? [{ ...WELCOME_MESSAGE, conversation_id: conversation.id }]
    : messages;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 ml-12 md:ml-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-medium truncate max-w-[180px] sm:max-w-none text-foreground">
              {conversation.title}
            </h1>
          </div>
        </div>
        <ModelSelector
          selectedModel={conversation.model}
          onSelect={onModelChange}
        />
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 scrollbar-thin">
        <div className="divide-y divide-border/30">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="ml-2 text-sm">Chargement des messages...</span>
              </div>
            </div>
          ) : (
            displayMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={streaming && index === displayMessages.length - 1 && message.role === 'assistant'}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-3 bg-destructive/10 text-destructive text-sm text-center rounded-xl border border-destructive/20">
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
