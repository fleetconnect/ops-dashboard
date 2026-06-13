"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import { relativeTime } from "@/lib/os";
import type { VaultNoteSummary } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";
import { FileText } from "lucide-react";

export function RecentNotes() {
  const fetcher = useCallback(() => api.vault.recent(25), []);
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<VaultNoteSummary[]>(fetcher);

  return (
    <VaultPanel
      status={status}
      loading={loading}
      error={error}
      lastRefreshed={lastRefreshed}
      onRefresh={refresh}
      isEmpty={!!data && data.length === 0}
      emptyText={EMPTY_STATE.recentNotes}
    >
      <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {data?.map((note) => (
          <li key={note.path} className="flex items-start gap-3 px-5 py-3.5">
            <FileText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground truncate">{note.title}</div>
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
