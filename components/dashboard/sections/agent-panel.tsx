"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Capability } from "@/lib/types";
import { PERSONAS, RUNTIME_AGENTS, type Persona } from "@/lib/personas";
import { CapabilityBadge, capabilityLabel } from "../capability-badge";
import { AgentStatus } from "./agent-status";
import type { useEventStream } from "@/lib/use-event-stream";
import { ChevronDown, ChevronRight, Bot, Wrench, FolderLock, ShieldCheck } from "lucide-react";

type Stream = ReturnType<typeof useEventStream>;

// The Agent Panel is the default landing — the front door to the whole system. It shows the
// Layer-1 cognitive partners (DASHBOARD.md) the operator works with. Hermes' live status is the
// real backend reasoning-runtime capability; the other partners are declared roles whose live
// activity Control Center does not track in Phase 1 (shown honestly, never faked as "Active").
export function AgentPanel({ stream }: { stream: Stream }) {
  const [capabilities, setCapabilities] = useState<Capability[] | null>(null);
  const [capError, setCapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [advanced, setAdvanced] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setCapError(null);
    api
      .capabilities()
      .then((m) => setCapabilities(m.capabilities))
      .catch((e) => setCapError(String((e as Error).message)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const capFor = (id?: string): Capability | undefined =>
    id ? capabilities?.find((c) => c.id === id) : undefined;

  return (
    <div className="space-y-6">
      {capError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load live capability states: {capError}
          <button onClick={load} className="ml-3 underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {PERSONAS.map((p) => (
          <PersonaCard
            key={p.id}
            persona={p}
            capability={capFor(p.backsCapabilityId)}
            loading={loading}
          />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setAdvanced((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground"
        >
          <span className="flex items-center gap-2">
            {advanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Advanced: runtime execution agents
          </span>
          <span className="text-xs text-muted-foreground">
            {RUNTIME_AGENTS.length} subordinate components
          </span>
        </button>
        {advanced && (
          <div className="border-t border-border px-5 py-4 space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              These are functions Hermes dispatches, not cognitive partners. Each layer&apos;s
              state below is derived only from the real event log — a layer with no matching events
              has simply never run. Runtime agents:{" "}
              <span className="text-foreground/80">{RUNTIME_AGENTS.join(", ")}</span>.
            </p>
            <AgentStatus stream={stream} />
          </div>
        )}
      </div>
    </div>
  );
}

function PersonaCard({
  persona,
  capability,
  loading,
}: {
  persona: Persona;
  capability?: Capability;
  loading: boolean;
}) {
  const isOrchestrator = persona.tracking === "orchestrator";

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{persona.name}</div>
            <div className="text-xs text-muted-foreground">{persona.role}</div>
          </div>
        </div>
        {isOrchestrator ? (
          loading ? (
            <span className="text-xs text-muted-foreground">checking…</span>
          ) : capability ? (
            <CapabilityBadge state={capability.state} reason={capability.reason} />
          ) : (
            <span className="text-xs text-muted-foreground">status unknown</span>
          )
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-muted text-muted-foreground border-border"
            title="Control Center does not track this partner's live activity in Phase 1."
          >
            Not tracked in Phase 1
          </span>
        )}
      </div>

      {isOrchestrator && capability && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {capabilityLabel(capability.state)} — {capability.reason}
        </p>
      )}

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-1.5">
          Responsibilities
        </div>
        <div className="flex flex-wrap gap-1.5">
          {persona.responsibilities.map((r) => (
            <span
              key={r}
              className="px-2 py-0.5 rounded-md bg-secondary text-xs text-secondary-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <dl className="space-y-2 text-xs">
        <Detail icon={Wrench} label="Allowed tools" value={persona.allowedTools} />
        <Detail icon={FolderLock} label="Allowed workspace" value={persona.allowedWorkspace} />
        <Detail icon={ShieldCheck} label="Review requirement" value={persona.reviewRequirement} />
        <Detail
          icon={Bot}
          label="Current task / last activity"
          value="Not tracked in Phase 1 — live delegation telemetry is a later phase."
        />
      </dl>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-muted-foreground/70">{label}</dt>
        <dd className="text-foreground/90 leading-snug">{value}</dd>
      </div>
    </div>
  );
}
