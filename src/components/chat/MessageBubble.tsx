import { User, Sparkles } from 'lucide-react';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-8 px-4 animate-fade-in">
        <div className="max-w-lg glass-panel rounded-3xl p-6 text-center border-glow glow-md">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-4 glow-sm float">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="prose-chat text-sm">
            {message.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-4 py-6 px-4 md:px-6 animate-fade-in transition-all duration-300",
        isUser ? "bg-transparent" : "glass-panel border-y border-primary/5"
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            isUser 
              ? "bg-gradient-to-br from-secondary/80 to-muted/60 text-foreground border border-border/50" 
              : "bg-gradient-to-br from-primary/30 to-accent/20 text-primary border border-primary/30 glow-sm"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold",
              isUser ? "text-muted-foreground" : "text-primary text-glow"
            )}>
              {isUser ? 'Vous' : 'Tauphile'}
            </span>
            {!isUser && (
              <span className="text-[10px] text-muted-foreground/80 glass-card px-2 py-0.5 rounded-full">
                Agent RAG
              </span>
            )}
          </div>
          <div className={cn("prose-chat", isStreaming && !message.content && "streaming-cursor")}>
            {message.content ? (
              message.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </span>
              ))
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </span>
            ) : null}
            {isStreaming && message.content && (
              <span className="inline-block w-2 h-4 bg-primary/80 ml-0.5 animate-pulse rounded-sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
