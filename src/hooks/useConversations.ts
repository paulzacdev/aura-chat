import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ 
          title: 'Nouvelle conversation',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newConversation = data as Conversation;
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Erreur lors de la création de la conversation');
      return null;
    }
  }, [user]);

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError('Erreur lors de la mise à jour de la conversation');
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Erreur lors de la suppression de la conversation');
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    refreshConversations: fetchConversations,
  };
}
