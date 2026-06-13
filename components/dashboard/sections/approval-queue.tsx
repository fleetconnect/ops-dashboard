"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/os";
import { ACTION_COPY, EMPTY_STATE, TERM_REPLACE, TERM_SUBTITLE } from "@/lib/copy";
import type { Approval, ReviewContext, VerdictRecord, VerdictType } from "@/lib/types";
import {
  CheckCircle2,
  Pencil,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Inbox,
  Target,
  ShieldCheck,
  FileText,
} from "lucide-react";

type Mode = "view" | "edit" | "reject";

function severityTone(sev: string): string {
  if (sev === "major" || sev === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
  if (sev === "minor") return "bg-warning/10 text-warning border-warning/30";
  return "bg-secondary text-muted-foreground border-border";
}

export function ApprovalQueue() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [verdictMap, setVerdictMap] = useState<Record<string, VerdictRecord>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ctx, setCtx] = useState<ReviewContext | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const [items, verdicts] = await Promise.all([api.pendingApprovals(), api.verdicts(200)]);
      setApprovals(items);
      const map: Record<string, VerdictRecord> = {};
      for (const v of verdicts) map[v.approvalId] = v;
      setVerdictMap(map);
      setSelectedId((cur) => cur ?? items[0]?.id ?? null);
    } catch (e) {
      setListError(String((e as Error).message ?? e));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadCtx = useCallback(async (id: string) => {
    setPanelError(null);
    setCtx(null);
    try {
      setCtx(await api.reviewContext(id));
    } catch (e) {
      setPanelError(String((e as Error).message ?? e));
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadCtx(selectedId);
  }, [selectedId, loadCtx]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <PendingList
        approvals={approvals}
        verdictMap={verdictMap}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={loadList}
        loading={loadingList}
        error={listError}
      />
      <ReviewPanel
        ctx={ctx}
        error={panelError}
        selectedId={selectedId}
        existingVerdict={selectedId ? verdictMap[selectedId] ?? ctx?.verdict ?? null : null}
        onVerdictRecorded={async () => {
          await loadList();
          if (selectedId) await loadCtx(selectedId);
        }}
      />
    </div>
  );
}

function PendingList({
  approvals,
  verdictMap,
  selectedId,
  onSelect,
  onRefresh,
  loading,
  error,
}: {
  approvals: Approval[];
  verdictMap: Record<string, VerdictRecord>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pending Queue</h2>
          <p className="text-xs text-muted-foreground">{approvals.length} awaiting your decision</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80 leading-snug">
            Verdict: {TERM_SUBTITLE.verdict}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {error ? (
        <div className="p-4 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : approvals.length === 0 && !loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <Inbox className="w-6 h-6" />
          <span className="leading-relaxed">{EMPTY_STATE.approvalQueue}</span>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-y-auto">
          {approvals.map((a) => {
            const v = verdictMap[a.id];
            const subject = (a.output.subject as string) ?? (a.output.entity_ref as string) ?? a.id;
            const isActive = a.id === selectedId;
            return (
              <li key={a.id}>
                <button
                  onClick={() => onSelect(a.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors",
                    isActive ? "bg-secondary" : "hover:bg-secondary/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{subject}</span>
                    {v ? (
                      <VerdictPill verdict={v.verdict} />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wide text-warning font-semibold shrink-0">
                        pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-secondary">{a.agentId}</span>
                    <span>{relativeTime(a.createdAt)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function VerdictPill({ verdict }: { verdict: VerdictType }) {
  const tone =
    verdict === "APPROVED"
      ? "bg-success/10 text-success"
      : verdict === "EDITED"
      ? "bg-chart-1/10 text-chart-1"
      : "bg-destructive/10 text-destructive";
  return (
    <span className={cn("text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0", tone)}>
      {verdict.toLowerCase()}
    </span>
  );
}

function ReviewPanel({
  ctx,
  error,
  selectedId,
  existingVerdict,
  onVerdictRecorded,
}: {
  ctx: ReviewContext | null;
  error: string | null;
  selectedId: string | null;
  existingVerdict: VerdictRecord | null;
  onVerdictRecorded: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [reason, setReason] = useState("");
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const draftText = ctx?.draft.message ?? "";

  useEffect(() => {
    setMode("view");
    setReason("");
    setEditText(draftText);
    setSubmitError(null);
  }, [selectedId, draftText]);

  if (!selectedId) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
        Select a draft from the queue to review.
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-sm text-destructive flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (!ctx) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
        Loading review context…
      </div>
    );
  }

  const opp = ctx.opportunity;
  const gov = ctx.governance;

  const submit = async (verdict: VerdictType) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: { verdict: VerdictType; reason?: string; after_text?: string; decided_by: string } = {
        verdict,
        decided_by: "human",
      };
      if (verdict !== "APPROVED") body.reason = reason.trim();
      if (verdict === "EDITED") body.after_text = editText;
      await api.recordVerdict(selectedId, body);
      await onVerdictRecorded();
      setMode("view");
    } catch (e) {
      setSubmitError(String((e as Error).message ?? e));
    } finally {
      setSubmitting(false);
    }
  };

  const reasonRequiredMissing = (mode === "edit" || mode === "reject") && reason.trim().length === 0;

  return (
    <div className="space-y-4">
      {existingVerdict && (
        <div className="bg-secondary/60 border border-border rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
          <VerdictPill verdict={existingVerdict.verdict} />
          <span className="text-muted-foreground">
            Verdict recorded {relativeTime(existingVerdict.createdAt)} by {existingVerdict.decidedBy}
            {existingVerdict.reason ? ` — "${existingVerdict.reason}"` : ""}
          </span>
        </div>
      )}

      {/* Draft */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <FileText className="w-4 h-4" />
          Draft message
          {ctx.draft.channel && <span className="px-1.5 py-0.5 rounded bg-secondary normal-case">{ctx.draft.channel}</span>}
        </div>
        {ctx.draft.subject && <p className="text-sm font-semibold text-foreground mb-2">{ctx.draft.subject}</p>}
        {mode === "edit" ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={6}
            className="w-full rounded-lg bg-secondary border border-border p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
          />
        ) : (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{draftText || "(no message body)"}</p>
        )}
      </div>

      {/* Verdict bar */}
      <div className="bg-card border border-border rounded-xl p-5">
        {(mode === "edit" || mode === "reject") && (
          <div className="mb-3">
            <p className="mb-2 text-xs text-muted-foreground leading-relaxed">
              {mode === "edit" ? ACTION_COPY.editConfirm : ACTION_COPY.rejectConfirm}
            </p>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reason {mode === "edit" ? "(why you edited)" : "(why you rejected)"} — required
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={ACTION_COPY.reasonPlaceholder}
              className="mt-1 w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
            />
          </div>
        )}
        {submitError && (
          <div className="mb-3 text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {mode === "view" ? (
            <div className="w-full space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{ACTION_COPY.approveConfirm}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => submit("APPROVED")}
                  disabled={submitting}
                  title={ACTION_COPY.approveConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success/15 text-success border border-success/30 text-sm font-medium hover:bg-success/25 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    setMode("edit");
                    setEditText(draftText);
                  }}
                  disabled={submitting}
                  title={ACTION_COPY.editConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-chart-1/15 text-chart-1 border border-chart-1/30 text-sm font-medium hover:bg-chart-1/25 transition-colors disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setMode("reject")}
                  disabled={submitting}
                  title={ACTION_COPY.rejectConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 text-sm font-medium hover:bg-destructive/25 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => submit(mode === "edit" ? "EDITED" : "REJECTED")}
                disabled={submitting || reasonRequiredMissing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm {mode === "edit" ? "edit" : "rejection"}
              </button>
              <button
                onClick={() => {
                  setMode("view");
                  setReason("");
                  setSubmitError(null);
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Opportunity summary */}
      {opp && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Target className="w-4 h-4" />
            Opportunity
          </div>
          <p className="mb-3 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.opportunity}</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded-md bg-secondary text-xs font-semibold text-foreground">
              Score {opp.priorityScore}
            </span>
            <span
              className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
              title="How closely this company fits who we serve"
            >
              {TERM_REPLACE.icpFit} {(opp.icpFit * 100).toFixed(0)}%
            </span>
            <span className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">{opp.play}</span>
            {opp.prediction && (
              <span
                className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                title="Our estimate of the chance this becomes a deal"
              >
                {TERM_REPLACE.prediction}: {opp.prediction.prediction} ({(opp.prediction.confidence * 100).toFixed(0)}%)
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            <span className="text-muted-foreground">Thesis: </span>
            {opp.thesis}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.thesis}</p>
        </div>
      )}

      {/* Governance gate + risk flags */}
      {gov && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Governance gate
            </div>
            <span
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium border",
                gov.status === "approved"
                  ? "bg-success/10 text-success border-success/30"
                  : gov.status === "rejected"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-warning/10 text-warning border-warning/30"
              )}
            >
              {gov.status} · {gov.overall_score}
            </span>
          </div>
          <p className="-mt-1 mb-3 text-[11px] text-muted-foreground/80 leading-snug">{TERM_SUBTITLE.governance}</p>
          {gov.issues && gov.issues.length > 0 ? (
            <ul className="space-y-2">
              {gov.issues.map((issue, i) => (
                <li key={i} className={cn("rounded-lg border p-3 text-xs", severityTone(issue.severity))}>
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {issue.type} · {issue.severity}
                  </div>
                  {issue.excerpt && <p className="mt-1 italic opacity-80">&ldquo;{issue.excerpt}&rdquo;</p>}
                  <p className="mt-1 opacity-90">{issue.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No risk flags raised.</p>
          )}
        </div>
      )}

      {/* Source evidence */}
      {ctx.evidence.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Source evidence ({ctx.evidence.length})
          </div>
          <ul className="space-y-2">
            {ctx.evidence.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-secondary/40 p-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-secondary uppercase">{s.source}</span>
                  <span>{s.signalType}</span>
                  {typeof s.score === "number" && <span>score {s.score}</span>}
                </div>
                <p className="text-foreground/90">{s.rawEvidence}</p>
                {s.evidenceUrl && (
                  <a href={s.evidenceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    {s.evidenceUrl}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
