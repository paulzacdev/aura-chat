-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  model TEXT NOT NULL DEFAULT 'gpt-5-mini',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access since no auth)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Allow public read conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update conversations" ON public.conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete conversations" ON public.conversations FOR DELETE USING (true);

CREATE POLICY "Allow public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete messages" ON public.messages FOR DELETE USING (true);

-- Create index for faster message retrieval
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;