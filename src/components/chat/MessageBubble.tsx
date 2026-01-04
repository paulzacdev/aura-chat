import { User, Bot } from 'lucide-react';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-4 p-4 animate-fade-in",
        isUser ? "bg-transparent" : "bg-card/50"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-xs font-medium text-muted-foreground">
          {isUser ? 'Vous' : 'Assistant'}
        </div>
        <div className="prose-chat">
          {message.content || (isStreaming && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-subtle" />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-subtle" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-subtle" style={{ animationDelay: '0.4s' }} />
            </span>
          ))}
          {message.content && message.content.split('\n').map((line, i) => (
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
