"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { VaultStatus } from "./types";

// Shared loader for read-only vault (Plane B) sections. Fetches the requested resource and the
// vault status together so every Knowledge screen can honestly show blocked/degraded/error
// states and a real last-refreshed time. No writes — every call here is a read.
export interface VaultResource<T> {
  data: T | null;
  status: VaultStatus | null;
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  refresh: () => void;
}

export function useVaultResource<T>(fetcher: () => Promise<T>): VaultResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // The fetcher identity is owned by the caller; we intentionally depend on it so callers can
  // pass a useCallback-memoized fetcher (e.g. one that closes over a query string).
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetcher(), api.vault.status().catch(() => null)])
      .then(([resource, vaultStatus]) => {
        setData(resource);
        setStatus(vaultStatus);
        setLastRefreshed(new Date());
      })
      .catch((e) => setError(String((e as Error).message ?? e)))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, status, loading, error, lastRefreshed, refresh };
}
