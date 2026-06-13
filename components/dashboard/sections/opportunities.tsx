"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { OpportunityObject, ThesisStatus } from "@/lib/types";
import { EMPTY_STATE, TERM_REPLACE, TERM_SUBTITLE } from "@/lib/copy";
import { AlertTriangle, GitBranch, RefreshCw, Target } from "lucide-react";

// Thesis-status is one of exactly two human write paths in this UI (the other is the verdict).
// Setting confirmed / partial / refuted requires an evidence note and PATCHes the opportunity,
// which emits a thesis_status.changed event into the stream.
const THESIS_CHOICES: ThesisStatus[] = ["confirmed", "partial", "refuted"];

function scoreTone(n: number): string {
  if (n >= 70) return "bg-success/10 text-success border-success/30";
  if (n >= 45) return "bg-warning/10 text-warning border-warning/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
}

function thesisTone(s: ThesisStatus): string {
  if (s === "confirmed") return "bg-success/10 text-success border-success/30";
  if (s === "partial") return "bg-warning/10 text-warning border-warning/30";
  if (s === "refuted") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-secondary text-muted-foreground border-border";
}

export function Opportunities({ onWalkLineage }: { onWalkLineage: (id: string) => void }) {
  const [rows, setRows] = useState<OpportunityObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await api.opportunities();
      setRows(items);
      setSelectedId((cur) => cur ?? items[0]?.id ?? null);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = selectedId ? rows.find((o) => o.id === selectedId) ?? null : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Opportunities</h2>
            <p className="text-xs text-muted-foreground">{rows.length} built so far</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.opportunity}</p>
          </div>
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        {error ? (
          <div className="p-4 text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : rows.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground leading-relaxed">{EMPTY_STATE.opportunities}</div>
        ) : (
          <ul className="divide-y divide-border overflow-y-auto">
            {rows.map((o) => {
              const isActive = o.id === selectedId;
              return (
                <li key={o.id}>
                  <button
                    onClick={() => setSelectedId(o.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors",
                      isActive ? "bg-secondary" : "hover:bg-secondary/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{o.entityRef}</span>
                      <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded border shrink-0", scoreTone(o.priorityScore))}>
                        {o.priorityScore}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{o.thesis}</p>
                    <span className={cn("mt-1.5 inline-flex text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded border", thesisTone(o.thesisStatus))}>
                      {o.thesisStatus}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected ? (
        <OpportunityDetail opp={selected} onChanged={load} onWalkLineage={onWalkLineage} />
      ) : (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          Select an opportunity to inspect its thesis and set its status.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}

function OpportunityDetail({
  opp,
  onChanged,
  onWalkLineage,
}: {
  opp: OpportunityObject;
  onChanged: () => void;
  onWalkLineage: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Target className="w-4 h-4" />
            {opp.entityRef}
          </div>
          <button
            onClick={() => onWalkLineage(opp.id)}
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline shrink-0"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Walk lineage
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={cn("px-2 py-1 rounded-md text-xs font-semibold border", scoreTone(opp.priorityScore))}>
            priority {opp.priorityScore}
          </span>
          <span
            className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
            title="How closely this company fits who we serve"
          >
            {TERM_REPLACE.icpFit} {Math.round((opp.icpFit ?? 0) * 100)}%
          </span>
          <span className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">{opp.play}</span>
          <span className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">status: {opp.status}</span>
          <span className={cn("px-2 py-1 rounded-md text-xs font-medium border", thesisTone(opp.thesisStatus))}>
            thesis: {opp.thesisStatus}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <Field label="Thesis (falsifiable)">{opp.thesis}</Field>
            <p className="mt-1 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.thesis}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Why now">{opp.whyNow}</Field>
            <Field label="Why us">{opp.whyUs}</Field>
            <Field label="Why this person">{opp.whyThisPerson}</Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Business problem">{opp.businessProblem}</Field>
            <Field label="Desired outcome">{opp.desiredOutcome}</Field>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">{opp.id}</p>
        </div>
      </div>

      <ThesisControl opp={opp} onChanged={onChanged} />
    </div>
  );
}

function ThesisControl({ opp, onChanged }: { opp: OpportunityObject; onChanged: () => void }) {
  const [choice, setChoice] = useState<ThesisStatus | "">("");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChoice("");
    setEvidence("");
    setError(null);
  }, [opp.id]);

  const submit = async () => {
    if (!choice) {
      setError("Pick a status.");
      return;
    }
    if (!evidence.trim()) {
      setError("An evidence note is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.setThesisStatus(opp.id, { status: choice, evidence: evidence.trim() });
      setChoice("");
      setEvidence("");
      onChanged();
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Thesis status control
        <span className="ml-2 normal-case font-normal text-muted-foreground/70">write path · emits thesis_status.changed</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {THESIS_CHOICES.map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
              choice === c
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {choice && (
        <input
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Evidence note (required) — what resolved this thesis?"
          className="w-full h-9 px-3 mb-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
        />
      )}
      {error && (
        <div className="mb-3 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={submit}
        disabled={busy || !choice}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
        Set thesis status
      </button>
    </div>
  );
}
