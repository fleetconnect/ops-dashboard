"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { EVENT_LABELS, isFixtureEvent, relativeTime } from "@/lib/os";
import type { OpportunityLineage } from "@/lib/types";
import { AlertTriangle, GitBranch, Search } from "lucide-react";

// Lineage is opportunity-rooted and is a join, not a graph engine. A searched id that is a
// signal or interpretation resolves up to its owning opportunity, then the full chain renders
// vertically: signals -> interpretations -> opportunity -> downstream events in time order.
async function resolveLineage(id: string): Promise<{ data: OpportunityLineage | null; clicked: string }> {
  try {
    return { data: await api.lineage(id), clicked: id };
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    if (!msg.includes("404") && !msg.toLowerCase().includes("not found")) throw e;
  }
  const opps = await api.opportunities(200);
  const owner = opps.find(
    (o) => o.id === id || o.signalIds.includes(id) || o.interpretationIds.includes(id)
  );
  if (!owner) return { data: null, clicked: id };
  return { data: await api.lineage(owner.id), clicked: id };
}

function Node({
  kind,
  dot,
  title,
  body,
  id,
  highlight,
  meta,
}: {
  kind: string;
  dot: string;
  title?: string | null;
  body?: string | null;
  id?: string;
  highlight?: boolean;
  meta?: React.ReactNode;
}) {
  return (
    <div className="relative pl-6">
      <span
        className={cn(
          "absolute left-0 top-3 w-3 h-3 rounded-full",
          dot,
          highlight && "ring-2 ring-accent ring-offset-2 ring-offset-background"
        )}
      />
      <div className={cn("rounded-lg border p-3", highlight ? "border-accent bg-accent/5" : "border-border bg-card")}>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
            {EVENT_LABELS[kind] ?? kind}
          </span>
          {meta}
          {id && <span className="font-mono text-[11px] text-muted-foreground">{id.slice(0, 8)}</span>}
        </div>
        {title && <div className="text-sm font-medium text-foreground">{title}</div>}
        {body && <div className="mt-1 text-sm text-foreground/80">{body}</div>}
      </div>
    </div>
  );
}

export function Lineage({ initialId }: { initialId?: string | null }) {
  const [query, setQuery] = useState(initialId ?? "");
  const [resolved, setResolved] = useState<string | null>(initialId ?? null);
  const [data, setData] = useState<OpportunityLineage | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data: lineage, clicked: c } = await resolveLineage(trimmed);
      setData(lineage);
      setClicked(c);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      setQuery(initialId);
      setResolved(initialId);
    }
  }, [initialId]);

  useEffect(() => {
    if (resolved) run(resolved);
  }, [resolved, run]);

  const ordered = data ? [...data.events].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : [];

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-muted-foreground">
        Search any object id — opportunity, interpretation, or signal. Lineage is opportunity-rooted:
        a signal or interpretation id resolves up to its owning opportunity, then the full ancestry
        chain renders in order. This is a join over the event log, not a graph engine.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResolved(query);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste an opportunity / interpretation / signal id"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent font-mono"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Resolve
        </button>
      </form>

      {loading && <div className="text-sm text-muted-foreground">Resolving…</div>}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && resolved && !data && (
        <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <span className="font-mono text-foreground/80">{clicked}</span> is not an opportunity and no
          opportunity references it. Lineage is opportunity-rooted — search an opportunity or one of its
          signal / interpretation ids.
        </div>
      )}

      {data && (
        <div className="space-y-3">
          {data.signals.map((s) => (
            <Node
              key={s.id}
              kind="signal"
              dot="bg-chart-2"
              id={s.id}
              highlight={clicked === s.id}
              meta={
                <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">
                  {s.source} · {s.signalType}
                </span>
              }
              body={s.rawEvidence}
            />
          ))}
          {data.interpretations.map((it) => (
            <Node
              key={it.id}
              kind="interpretation"
              dot="bg-chart-1"
              id={it.id}
              highlight={clicked === it.id}
              meta={
                <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">
                  {it.commercialMode}
                </span>
              }
              title={it.likelyProblem}
              body={it.reasoningTrace}
            />
          ))}
          <Node
            kind="opportunity"
            dot="bg-success"
            id={data.opportunity.id}
            highlight={clicked === data.opportunity.id}
            meta={
              <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">
                priority {data.opportunity.priorityScore} · thesis {data.opportunity.thesisStatus}
              </span>
            }
            title={data.opportunity.thesis}
            body={data.opportunity.whyNow}
          />
          {ordered.map((e) => (
            <Node
              key={e.id}
              kind={e.type}
              dot="bg-muted-foreground"
              id={e.id}
              meta={
                <span className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{relativeTime(e.createdAt)}</span>
                  {isFixtureEvent(e) && (
                    <span className="text-[10px] uppercase tracking-wide text-warning font-semibold">demo</span>
                  )}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
