import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Menu, X as CloseIcon } from 'lucide-react';
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
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={onToggle}
      >
        {isOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <Button
            onClick={onCreate}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                Aucune conversation. Commencez-en une nouvelle !
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                    selectedId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                  onClick={() => onSelect(conversation.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  
                  {editingId === conversation.id ? (
                    <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm">
                        {conversation.title}
                      </span>
                      
                      <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleStartEdit(conversation)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => onDelete(conversation.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            Chat IA Sécurisé
          </p>
        </div>
      </aside>
    </>
  );
}
