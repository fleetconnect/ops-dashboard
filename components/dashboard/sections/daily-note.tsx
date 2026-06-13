"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import type { DailyNoteResult } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyNote() {
  const [date, setDate] = useState(todayIso());

  const fetcher = useCallback(() => api.vault.daily(date), [date]);
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<DailyNoteResult>(fetcher);

  // found:false is honest, not an error — the day simply has no note.
  const isEmpty = !!data && !data.found;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="daily-date" className="text-sm text-muted-foreground">
          Date
        </label>
        <input
          id="daily-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <VaultPanel
        status={status}
        loading={loading}
        error={error}
        lastRefreshed={lastRefreshed}
        onRefresh={refresh}
        isEmpty={isEmpty}
        emptyText={EMPTY_STATE.dailyNote}
      >
        {data?.found && data.note && (
          <article className="rounded-xl border border-border bg-card p-6 space-y-3">
            <header>
              <h2 className="text-base font-semibold text-foreground">{data.note.title}</h2>
              <p className="text-xs text-muted-foreground">{data.note.path}</p>
            </header>
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90 font-sans">
              {data.note.body}
            </pre>
          </article>
        )}
      </VaultPanel>
    </div>
  );
}
