"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import { relativeTime } from "@/lib/os";
import type { ConversationSummary } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";
import { FileConversation } from "./file-conversation";
import { MessagesSquare, Users, Building2 } from "lucide-react";

export function Conversations() {
  const fetcher = useCallback(() => api.vault.conversations(), []);
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<ConversationSummary[]>(fetcher);

  return (
    <VaultPanel
      status={status}
      loading={loading}
      error={error}
      lastRefreshed={lastRefreshed}
      onRefresh={refresh}
      isEmpty={!!data && data.length === 0}
      emptyText={EMPTY_STATE.conversations}
      beforeContent={<FileConversation onFiled={refresh} />}
    >
      <ul className="space-y-2">
        {data?.map((c) => (
          <li key={c.path} className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
            <div className="flex items-start gap-3">
              <MessagesSquare className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{c.title}</div>
                <div className="text-xs text-muted-foreground truncate">{c.path}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {c.date ?? relativeTime(c.modifiedAt)}
              </div>
            </div>
            {(c.people.length > 0 || c.companies.length > 0) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pl-7 text-xs text-muted-foreground">
                {c.people.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {c.people.join(", ")}
                  </span>
                )}
                {c.companies.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {c.companies.join(", ")}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </VaultPanel>
  );
}
