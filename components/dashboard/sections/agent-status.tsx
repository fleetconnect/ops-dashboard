"use client";

import { cn } from "@/lib/utils";
import { AGENT_LAYERS, EVENT_LABELS, relativeTime } from "@/lib/os";
import { TERM_SUBTITLE } from "@/lib/copy";
import type { OpportunityEvent } from "@/lib/types";
import type { useEventStream } from "@/lib/use-event-stream";

type Stream = ReturnType<typeof useEventStream>;

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

type State = "active" | "idle" | "dormant";

function deriveState(last: OpportunityEvent | null): State {
  if (!last) return "dormant";
  const age = Date.now() - new Date(last.createdAt).getTime();
  return age <= ACTIVE_WINDOW_MS ? "active" : "idle";
}

const stateMeta: Record<State, { label: string; dot: string; text: string }> = {
  active: { label: "active", dot: "bg-success", text: "text-success" },
  idle: { label: "idle", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  dormant: { label: "no runs yet", dot: "bg-border", text: "text-muted-foreground" },
};

export function AgentStatus({ stream }: { stream: Stream }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Each layer&apos;s state is derived only from the event log — a layer with no matching events
        has simply never run. Static snapshot, no animation. The animated Agent Network with replay
        is Phase 3, gated on 100+ real events.
      </p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_120px] gap-4 px-5 py-3 border-b border-border bg-secondary/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Agent / layer</span>
          <span>Last event</span>
          <span>Last run</span>
          <span>State</span>
        </div>
        <ul className="divide-y divide-border">
          {AGENT_LAYERS.map((layer) => {
            const events = stream.events.filter((e) => layer.eventTypes.includes(e.type));
            const last = events[0] ?? null;
            const state = deriveState(last);
            const meta = stateMeta[state];
            return (
              <li
                key={layer.id}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_120px] gap-2 md:gap-4 px-5 py-4 md:items-center"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{layer.name}</div>
                  <div className="text-xs text-muted-foreground">{layer.role}</div>
                  {layer.id.startsWith("sentinel") && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.sentinel}</div>
                  )}
                </div>
                <div className="text-sm text-foreground/90">
                  {last ? EVENT_LABELS[last.type] ?? last.type : <span className="text-muted-foreground">—</span>}
                  {last && <span className="ml-2 text-xs text-muted-foreground">({events.length} in feed)</span>}
                </div>
                <div className="text-sm text-muted-foreground">{last ? relativeTime(last.createdAt) : "—"}</div>
                <div className={cn("inline-flex items-center gap-2 text-sm font-medium", meta.text)}>
                  <span className={cn("w-2 h-2 rounded-full", meta.dot)} />
                  {meta.label}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
