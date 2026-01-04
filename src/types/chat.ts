export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: ModelType;
  created_at: string;
  updated_at: string;
}

export type ModelType = 'gpt-4-mini' | 'gpt-5' | 'gpt-oss-120b';

export interface ModelInfo {
  id: ModelType;
  name: string;
  description: string;
  badge?: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'gpt-4-mini',
    name: 'GPT-4 Mini',
    description: 'Rapide et efficace',
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'Le plus puissant',
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B',
    description: 'Open source, gratuit',
    badge: 'Gratuit',
  },
];
