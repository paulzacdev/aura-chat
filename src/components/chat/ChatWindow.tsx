import { useRef, useEffect } from 'react';
import { MessageSquarePlus, Cross, Sparkles, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { Message, Conversation } from '@/types/chat';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onNewConversation: () => void;
}

// System welcome message for new conversations
const WELCOME_MESSAGE: Message = {
  id: 'welcome-system',
  conversation_id: '',
  role: 'system',
  content: `Bienvenue dans Tauphile, votre assistant en théologie catholique. 🕊️

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
        <div className="max-w-lg text-center space-y-8 glass-panel p-10 rounded-3xl border-glow">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl flex items-center justify-center border border-primary/30 glow-lg float">
              <Cross className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 glass-card rounded-xl flex items-center justify-center glow-sm">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-semibold text-foreground text-glow">Bienvenue sur Tauphile</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Votre assistant en théologie catholique, alimenté par l'intelligence artificielle pour vous aider à explorer et approfondir votre foi.
            </p>
          </div>
          <Button 
            onClick={onNewConversation} 
            size="lg" 
            className="gap-2 h-14 px-8 rounded-2xl glow-md border border-primary/30 bg-primary/90 hover:bg-primary transition-all duration-300 text-lg"
          >
            <MessageSquarePlus className="h-5 w-5" />
            Commencer une conversation
          </Button>
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground glass-card px-4 py-2 rounded-xl mx-auto w-fit">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
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
      <div className="flex items-center px-4 md:px-6 py-4 glass-panel border-b border-primary/10">
        <div className="flex items-center gap-3 ml-12 md:ml-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20 glow-sm">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-medium truncate max-w-[180px] sm:max-w-none text-foreground text-lg">
              {conversation.title}
            </h1>
          </div>
        </div>
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
