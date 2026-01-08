import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/chat';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (content: string, model: string = 'google/gemini-2.5-flash') => {
    if (!conversationId || !content.trim()) return;

    setError(null);
    
    // Add user message to state and DB
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to DB
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: content.trim(),
      });

      // Prepare messages for API (excluding system messages from history)
      const apiMessages = [...messages, userMessage]
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      // Start streaming
      setStreaming(true);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de communication avec l\'IA');
      }

      // Create placeholder for assistant message
      const assistantMessageId = crypto.randomUUID();
      let assistantContent = '';

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        conversation_id: conversationId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }]);

      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                assistantContent += deltaContent;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            } catch {
              // Incomplete JSON, put it back
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }

      // Save assistant message to DB
      if (assistantContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
        });
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      // Remove the failed assistant message placeholder
      setMessages(prev => prev.filter(m => m.role === 'user' || m.content !== ''));
    } finally {
      setStreaming(false);
    }
  }, [conversationId, messages]);

  return {
    messages,
    loading,
    streaming,
    error,
    sendMessage,
    refreshMessages: fetchMessages,
  };
}
