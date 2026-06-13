// REST client for the Commercial Opportunity OS Express backend. Surfaces backend error
// bodies verbatim so the operator sees the real failure, never a swallowed one. Two write
// paths only: recordVerdict and setThesisStatus. Everything else is a read.

import type {
  Approval,
  CapabilityMap,
  ConversationSummary,
  DailyNoteResult,
  GoalSet,
  OpportunityEvent,
  OpportunityLineage,
  OpportunityObject,
  ProjectSummary,
  ReviewContext,
  SearchHit,
  SystemStatus,
  VaultNote,
  VaultNoteSummary,
  VaultStatus,
  VerdictRecord,
  VerdictType,
  ThesisStatus,
  WeeklyReview,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3100/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.error ?? JSON.stringify(body);
    } catch {
      // response had no JSON body; keep statusText
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),
  systemStatus: () => request<SystemStatus>("/system/status"),
  weeklyReview: (windowDays = 7) =>
    request<WeeklyReview>(`/weekly-review?window_days=${windowDays}`),
  pendingApprovals: () => request<Approval[]>("/approvals"),
  reviewContext: (approvalId: string) =>
    request<ReviewContext>(`/approvals/${approvalId}/review-context`),
  opportunities: (limit = 100) =>
    request<OpportunityObject[]>(`/opportunities?limit=${limit}`),
  lineage: (opportunityId: string) =>
    request<OpportunityLineage>(`/opportunities/${opportunityId}/lineage`),
  verdicts: (limit = 200) => request<VerdictRecord[]>(`/verdicts?limit=${limit}`),
  events: (limit = 100) => request<OpportunityEvent[]>(`/events?limit=${limit}`),

  recordVerdict: (
    approvalId: string,
    body: { verdict: VerdictType; reason?: string; decided_by?: string; after_text?: string }
  ) =>
    request<VerdictRecord>(`/approvals/${approvalId}/verdict`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  setThesisStatus: (
    opportunityId: string,
    body: { status: ThesisStatus; evidence?: string }
  ) =>
    request<OpportunityObject>(`/opportunities/${opportunityId}/thesis-status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Capability honesty layer — read-only.
  capabilities: () => request<CapabilityMap>("/capabilities"),

  // Vault (Plane B — durable knowledge). All read-only. Paths are vault-relative.
  vault: {
    status: () => request<VaultStatus>("/vault/status"),
    search: (q: string, folder?: string, limit = 50) => {
      const params = new URLSearchParams({ q, limit: String(limit) });
      if (folder) params.set("folder", folder);
      return request<SearchHit[]>(`/vault/search?${params.toString()}`);
    },
    recent: (limit = 25, folder?: string) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (folder) params.set("folder", folder);
      return request<VaultNoteSummary[]>(`/vault/recent?${params.toString()}`);
    },
    notes: (folder?: string) => {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      const qs = params.toString();
      return request<VaultNoteSummary[]>(`/vault/notes${qs ? `?${qs}` : ""}`);
    },
    projects: () => request<ProjectSummary[]>("/vault/projects"),
    goals: () => request<GoalSet>("/vault/goals"),
    conversations: () => request<ConversationSummary[]>("/vault/conversations"),
    daily: (date?: string) =>
      request<DailyNoteResult>(`/vault/daily${date ? `?date=${encodeURIComponent(date)}` : ""}`),
    note: (notePath: string) =>
      request<VaultNote>(`/vault/note?path=${encodeURIComponent(notePath)}`),
  },
};
