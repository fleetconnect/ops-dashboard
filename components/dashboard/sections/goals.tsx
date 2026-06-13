"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import { relativeTime } from "@/lib/os";
import type { GoalSet } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";
import { Flag } from "lucide-react";

export function Goals() {
  const fetcher = useCallback(() => api.vault.goals(), []);
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<GoalSet>(fetcher);

  // The backend reports found:false honestly when no goal-tagged notes exist — we surface that
  // as an empty state rather than inventing goals.
  const isEmpty = !!data && (!data.found || data.notes.length === 0);

  return (
    <VaultPanel
      status={status}
      loading={loading}
      error={error}
      lastRefreshed={lastRefreshed}
      onRefresh={refresh}
      isEmpty={isEmpty}
      emptyText={EMPTY_STATE.goals}
    >
      <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {data?.notes.map((note) => (
          <li key={note.path} className="flex items-start gap-3 px-5 py-3.5">
            <Flag className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{note.title}</div>
              <div className="text-xs text-muted-foreground truncate">{note.path}</div>
            </div>
            <div className="text-xs text-muted-foreground shrink-0">
              {relativeTime(note.modifiedAt)}
            </div>
          </li>
        ))}
      </ul>
    </VaultPanel>
  );
}
