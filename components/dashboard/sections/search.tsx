"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { EMPTY_STATE } from "@/lib/copy";
import type { SearchHit } from "@/lib/types";
import { useVaultResource } from "@/lib/use-vault-resource";
import { VaultPanel } from "../vault-panel";
import { Search as SearchIcon, FileText } from "lucide-react";

export function VaultSearch() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  // Search only runs against the committed query (set on submit), not on every keystroke, so a
  // refresh repeats the last real search rather than firing a request per character.
  const fetcher = useCallback(
    () => (query.trim() ? api.vault.search(query.trim(), undefined, 50) : Promise.resolve([])),
    [query]
  );
  const { data, status, loading, error, lastRefreshed, refresh } =
    useVaultResource<SearchHit[]>(fetcher);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search note titles and text…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent/15 text-accent text-sm font-medium hover:bg-accent/25 transition-colors"
        >
          Search
        </button>
      </form>

      {!hasQuery ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {EMPTY_STATE.searchPrompt}
        </div>
      ) : (
        <VaultPanel
          status={status}
          loading={loading}
          error={error}
          lastRefreshed={lastRefreshed}
          onRefresh={refresh}
          isEmpty={!!data && data.length === 0}
          emptyText={EMPTY_STATE.search}
        >
          <ul className="space-y-2">
            {data?.map((hit) => (
              <li
                key={hit.path}
                className="rounded-xl border border-border bg-card px-5 py-4 space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{hit.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{hit.path}</div>
                  </div>
                </div>
                {hit.excerpt && (
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {hit.excerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </VaultPanel>
      )}
    </div>
  );
}
