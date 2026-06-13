"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VAULT_SOURCE_LABEL } from "@/lib/copy";
import type { VaultStatus } from "@/lib/types";
import { RefreshCw, AlertTriangle, Database } from "lucide-react";

// Standard frame for every read-only Knowledge (Plane B) section. Renders the source-of-truth
// label, last-refreshed time, a refresh control, and honest loading/error/blocked/degraded
// states. Content (and empty states) are passed as children once data has loaded cleanly.
interface VaultPanelProps {
  status: VaultStatus | null;
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  onRefresh: () => void;
  isEmpty?: boolean;
  emptyText?: string;
  children?: React.ReactNode;
}

export function VaultPanel({
  status,
  loading,
  error,
  lastRefreshed,
  onRefresh,
  isEmpty,
  emptyText,
  children,
}: VaultPanelProps) {
  const blocked = status && status.state !== "available";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="w-3.5 h-3.5" />
          {VAULT_SOURCE_LABEL}
          {status?.rootLabel && <span className="text-muted-foreground/70">· {status.rootLabel}</span>}
        </span>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground/70">
              Last refreshed {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Honest vault posture: anything other than "available" is surfaced with its reason. */}
      {blocked && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm flex items-start gap-2",
            status!.state === "degraded"
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Vault {status!.state.replace(/_/g, " ")}: {status!.reason}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading from vault…
        </div>
      ) : !error && isEmpty ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : !error ? (
        children
      ) : null}
    </div>
  );
}
