"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import { relativeTime } from "@/lib/os";
import type { ProjectSummary } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";
import { FolderKanban } from "lucide-react";

function field(value: string | null): string {
  return value && value.trim() ? value : "—";
}

export function Projects() {
  const fetcher = useCallback(() => api.vault.projects(), []);
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<ProjectSummary[]>(fetcher);

  return (
    <VaultPanel
      status={status}
      loading={loading}
      error={error}
      lastRefreshed={lastRefreshed}
      onRefresh={refresh}
      isEmpty={!!data && data.length === 0}
      emptyText={EMPTY_STATE.projects}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((p) => (
          <div key={p.path} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <FolderKanban className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p.path}</div>
              </div>
              {p.staleDays > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {p.staleDays}d stale
                </span>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <Cell label="Status" value={field(p.status)} />
              <Cell label="Phase" value={field(p.phase)} />
              <Cell label="Owner" value={field(p.owner)} />
              <Cell label="Updated" value={relativeTime(p.modifiedAt)} />
            </dl>
            {p.nextAction && (
              <div className="text-xs">
                <span className="text-muted-foreground/70">Next action: </span>
                <span className="text-foreground/90">{p.nextAction}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </VaultPanel>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}
