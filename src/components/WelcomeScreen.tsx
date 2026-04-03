import { Pencil, Lightbulb, Search, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  personaName: string;
  onSendSuggestion: (text: string) => void;
}

const categories = [
  { icon: Pencil, label: 'Write', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { icon: Lightbulb, label: 'Plan', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { icon: Search, label: 'Research', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { icon: BookOpen, label: 'Learn', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

const suggestions: Record<string, string[]> = {
  Write: [
    'Write a professional email for me',
    'Help me draft a blog post',
    'Create a social media caption',
  ],
  Plan: [
    'Help me plan a weekly schedule',
    'Create a project roadmap',
    'Plan a marketing strategy',
  ],
  Research: [
    'Summarize the latest trends in AI',
    'Compare different approaches to...',
    'Find key facts about a topic',
  ],
  Learn: [
    'Explain a complex concept simply',
    'Quiz me on a topic',
    'Teach me something new today',
  ],
};

export function WelcomeScreen({ personaName, onSendSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
      <div
        className="text-center space-y-4"
        style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-widest uppercase text-primary">
          VERSACE22 ai
        </h1>
        <h2
          className="text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-tight"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          World's smartest AIs,
          <br />
          <span className="text-primary">side-by-side</span> with you
        </h2>
      </div>

      {/* Category chips */}
      <div
        className="mt-8 flex flex-wrap justify-center gap-2"
        style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
      >
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => onSendSuggestion(suggestions[cat.label][0])}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                       border transition-all duration-200 active:scale-[0.97]
                       hover:brightness-110 ${cat.color}`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Suggestion prompts */}
      <div
        className="mt-4 flex flex-wrap justify-center gap-2 max-w-lg"
        style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}
      >
        {['What can you help me with today?', 'Tell me about your expertise', 'Help me brainstorm an idea'].map((s) => (
          <button
            key={s}
            onClick={() => onSendSuggestion(s)}
            className="px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground
                       border border-border hover:bg-muted hover:border-primary/20
                       transition-all duration-200 active:scale-[0.97]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
