import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { WPORModel, getORFreeModelsWP, refreshORFreeModelsWP } from '@/lib/wp-api';
import { toast } from 'sonner';

/**
 * OpenRouter Free Model Presets card.
 * Mounted only on the AI Chat Pro Settings admin page (Feature 6).
 */
export function OpenRouterFreeModelsCard() {
  const [models, setModels] = useState<WPORModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const load = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const list = refresh ? await refreshORFreeModelsWP() : await getORFreeModelsWP();
      setModels(list);
      if (refresh) toast.success(`Refreshed: ${list.length} free models`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load OpenRouter models');
    }
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(false); }, []);

  const copy = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    toast.success('Model ID copied');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = filter
    ? models.filter(m => (m.id + ' ' + (m.name || '')).toLowerCase().includes(filter.toLowerCase()))
    : models;

  return (
    <div
      id="aicpp-or-free-models-card"
      className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-5 my-6 max-w-3xl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            OpenRouter Free Model Presets
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Browse free-tier models exposed by OpenRouter. Click a model ID to copy it into your settings.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter models…"
        className="w-full text-sm px-3 py-2 mb-3 rounded-md bg-muted/40 border border-border focus:outline-none focus:border-primary/40"
      />

      <div className="max-h-[420px] overflow-y-auto rounded-md border border-border divide-y divide-border">
        {loading && <p className="p-3 text-xs text-muted-foreground">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">No free models available.</p>
        )}
        {filtered.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.name || m.id}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                <code>{m.id}</code>
                {m.context_length ? ` · ${m.context_length.toLocaleString()} ctx` : ''}
              </div>
            </div>
            <button
              onClick={() => copy(m.id)}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-border hover:bg-background transition-colors"
            >
              {copiedId === m.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
              {copiedId === m.id ? 'Copied' : 'Copy ID'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
