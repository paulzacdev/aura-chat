import { useState, useEffect } from 'react';
import { Sparkles, Search, Brain, Lightbulb, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const THINKING_STEPS = [
  { icon: Search, label: 'Analyse de la question...' },
  { icon: Brain, label: 'Recherche dans les sources...' },
  { icon: Lightbulb, label: 'Réflexion théologique...' },
  { icon: PenLine, label: 'Rédaction de la réponse...' },
];

export function ThinkingIndicator() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = THINKING_STEPS[currentStep].icon;

  return (
    <div className="flex gap-4 py-6 px-4 md:px-6 animate-fade-in glass-panel border-y border-primary/5">
      <div className="max-w-3xl mx-auto w-full flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/20 text-primary border border-primary/30 glow-sm">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary text-glow">
              Tauphile
            </span>
            <span className="text-[10px] text-muted-foreground/80 glass-card px-2 py-0.5 rounded-full">
              Agent RAG
            </span>
          </div>

          {/* Thinking steps */}
          <div className="space-y-2">
            {THINKING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    isActive && "opacity-100",
                    isPast && "opacity-40",
                    !isActive && !isPast && "opacity-20"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300",
                      isActive && "bg-primary/20 border border-primary/40",
                      isPast && "bg-muted/50 border border-border/30",
                      !isActive && !isPast && "bg-muted/20 border border-border/20"
                    )}
                  >
                    {isActive ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : isPast ? (
                      <div className="w-2 h-2 bg-primary/60 rounded-full" />
                    ) : (
                      <StepIcon className="w-3 h-3 text-muted-foreground/50" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm transition-all duration-300",
                      isActive && "text-foreground font-medium",
                      isPast && "text-muted-foreground",
                      !isActive && !isPast && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
