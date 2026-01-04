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
      <div className="flex justify-center py-6 px-4 animate-fade-in">
        <div className="max-w-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
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
        "flex gap-4 py-6 px-4 md:px-6 animate-fade-in transition-colors",
        isUser ? "bg-transparent" : "bg-card/30"
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
            isUser 
              ? "bg-gradient-to-br from-secondary to-muted text-foreground" 
              : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary border border-primary/10"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold",
              isUser ? "text-muted-foreground" : "text-primary"
            )}>
              {isUser ? 'Vous' : 'Théologia'}
            </span>
            {!isUser && (
              <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-full">
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
