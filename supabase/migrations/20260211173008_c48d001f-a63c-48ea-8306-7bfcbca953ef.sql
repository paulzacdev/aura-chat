
-- Remove all public policies from conversations
DROP POLICY IF EXISTS "Allow public delete conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public update conversations" ON public.conversations;

-- Remove all public policies from messages
DROP POLICY IF EXISTS "Allow public delete messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public update messages" ON public.messages;

-- Create secure policies for messages based on conversation ownership
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid())
  )
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid())
  )
);

CREATE POLICY "Users can update messages in their conversations"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user_id = auth.uid())
  )
);
