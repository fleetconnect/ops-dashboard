"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ConnectorDescriptor, ConnectorState } from "@/lib/types";
import { RefreshCw, Plug, AlertTriangle } from "lucide-react";

const STATE_STYLE: Record<ConnectorState, string> = {
  available: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  degraded: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  blocked: "text-red-400 border-red-500/30 bg-red-500/10",
  not_configured: "text-muted-foreground border-border bg-secondary",
};

function fresh(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "unknown" : d.toLocaleString();
}

export function Integrations() {
  const [connectors, setConnectors] = useState<ConnectorDescriptor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.integrations();
      setConnectors(r.connectors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Plug className="w-3.5 h-3.5" /> Read-first connectors — capability state only, no secrets
        </span>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {connectors?.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{c.displayName}</div>
                <div className="text-xs text-muted-foreground">{c.provider} · {c.sourceOwnership}</div>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${STATE_STYLE[c.capabilityState]}`}>
                {c.capabilityState.replace(/_/g, " ")}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{c.reason}</div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground/80 pt-1 border-t border-border">
              <span>permissions: {c.permissionsGranted.join(" · ")}</span>
              <span>last sync: {fresh(c.lastSuccessfulSync)}</span>
              <span>freshness: {fresh(c.dataFreshness)}</span>
              <span>rate-limit: {c.rateLimitState}</span>
              {c.errorState && <span className="text-red-400">error: {c.errorState}</span>}
            </div>
            <div className="text-[11px] text-muted-foreground/70">ops: {c.supportedOperations.join(", ")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
