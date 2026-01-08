import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Menu, X as CloseIcon, BookOpen, Cross, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg"
        onClick={onToggle}
      >
        {isOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-72 glass-panel flex flex-col transition-all duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header with branding */}
        <div className="p-5 border-b border-primary/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border border-primary/30 glow-sm float">
              <Cross className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-foreground text-glow">Tauphile</h1>
              <p className="text-xs text-muted-foreground">Assistant en théologie</p>
            </div>
          </div>
          <Button
            onClick={onCreate}
            className="w-full justify-center gap-2 h-12 rounded-xl font-medium glow-sm border border-primary/30 bg-primary/90 hover:bg-primary transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1 scrollbar-thin">
          <div className="p-3 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Aucune conversation.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Commencez à explorer la foi catholique.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
                    selectedId === conversation.id
                      ? "glass-card glow-sm"
                      : "hover:bg-primary/5 text-sidebar-foreground"
                  )}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    selectedId === conversation.id
                      ? "bg-primary/20 text-primary glow-sm"
                      : "bg-muted/30 text-muted-foreground"
                  )}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  
                  {editingId === conversation.id ? (
                    <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-8 text-sm rounded-lg"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={handleSaveEdit}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={handleCancelEdit}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm font-medium">
                        {conversation.title}
                      </span>
                      
                      <div className="hidden group-hover:flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg opacity-70 hover:opacity-100"
                          onClick={() => handleStartEdit(conversation)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg text-destructive opacity-70 hover:opacity-100 hover:text-destructive"
                          onClick={() => onDelete(conversation.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center glass-card px-4 py-2 rounded-xl">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Agent RAG externe via n8n</span>
          </div>
        </div>
      </aside>
    </>
  );
}
