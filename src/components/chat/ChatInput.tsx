import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  streaming?: boolean;
}

export function ChatInput({ onSend, disabled, streaming }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled && !streaming) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="relative flex items-end gap-3 glass-card rounded-2xl p-3 transition-all duration-300 focus-within:glow-sm border-glow">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question sur la foi catholique..."
            disabled={disabled || streaming}
            className="min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-2 text-base placeholder:text-muted-foreground/60"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled || streaming}
            className="shrink-0 h-12 w-12 rounded-xl glow-sm border border-primary/30 bg-primary/90 hover:bg-primary transition-all duration-300"
          >
            {streaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 glass-card px-4 py-2 rounded-xl mx-auto w-fit">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span>Tauphile est un assistant IA. Vérifiez les informations avec le Catéchisme et le Magistère.</span>
        </div>
      </div>
    </div>
  );
}
