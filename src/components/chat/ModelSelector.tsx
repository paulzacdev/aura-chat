import { Check, ChevronDown, Sparkles, Zap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_MODELS, type ModelType, type ModelInfo } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onSelect: (model: ModelType) => void;
}

const modelIcons: Record<ModelType, typeof Sparkles> = {
  'gpt-4-mini': Zap,
  'gpt-5': Sparkles,
  'gpt-oss-120b': Gift,
};

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
  const Icon = modelIcons[currentModel.id];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentModel.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {AVAILABLE_MODELS.map((model) => {
          const ModelIcon = modelIcons[model.id];
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer",
                selectedModel === model.id && "bg-accent"
              )}
            >
              <ModelIcon className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {model.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {model.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {model.description}
                </p>
              </div>
              {selectedModel === model.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
