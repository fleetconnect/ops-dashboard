"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { FileConversationResult, SourceType } from "@/lib/types";
import { FilePlus2, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SOURCE_TYPES: SourceType[] = [
  "sales-call",
  "discovery-call",
  "linkedin",
  "email",
  "facebook",
  "voice-note",
  "meeting-transcript",
  "crm-export",
  "pasted-thread",
  "screenshot-text",
  "other",
];

const RESULT_STYLE: Record<string, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  created: { label: "Created", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", Icon: CheckCircle2 },
  already_exists: { label: "Already exists", cls: "text-sky-400 border-sky-500/30 bg-sky-500/10", Icon: CheckCircle2 },
  needs_review: { label: "Needs review", cls: "text-amber-400 border-amber-500/30 bg-amber-500/10", Icon: AlertTriangle },
  rejected: { label: "Rejected", cls: "text-red-400 border-red-500/30 bg-red-500/10", Icon: XCircle },
  failed: { label: "Failed", cls: "text-red-400 border-red-500/30 bg-red-500/10", Icon: XCircle },
};

function splitList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export function FileConversation({ onFiled }: { onFiled?: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FileConversationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [proposedTitle, setProposedTitle] = useState("");
  const [conversationDate, setConversationDate] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("sales-call");
  const [sourceReference, setSourceReference] = useState("");
  const [people, setPeople] = useState("");
  const [companies, setCompanies] = useState("");
  const [projects, setProjects] = useState("");
  const [approvalReference, setApprovalReference] = useState("");
  const [reviewedMarkdown, setReviewedMarkdown] = useState("");

  const canSubmit =
    !submitting && proposedTitle.trim() && approvalReference.trim() && reviewedMarkdown.trim();

  async function submit() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.vault.fileConversation({
        reviewedMarkdown,
        proposedTitle,
        conversationDate: conversationDate || undefined,
        sourceType,
        sourceReference: sourceReference || undefined,
        people: splitList(people),
        companies: splitList(companies),
        projects: splitList(projects),
        approvalReference,
      });
      setResult(res);
      if (res.result === "created") onFiled?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  const rs = result ? RESULT_STYLE[result.result] : null;
  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <FilePlus2 className="w-4 h-4 text-muted-foreground" />
          File Approved Conversation
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          Destination: 06 Conversations
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Proposed title</span>
              <input className={inputCls} value={proposedTitle} onChange={(e) => setProposedTitle(e.target.value)} placeholder="ScaleMatic Introduction Call" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Conversation date</span>
              <input className={inputCls} type="date" value={conversationDate} onChange={(e) => setConversationDate(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Source type</span>
              <select className={inputCls} value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)}>
                {SOURCE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Source reference (link/origin)</span>
              <input className={inputCls} value={sourceReference} onChange={(e) => setSourceReference(e.target.value)} placeholder="https://..." />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">People (comma-separated)</span>
              <input className={inputCls} value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Brian Hong, Kalei Poteat" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Companies (comma-separated)</span>
              <input className={inputCls} value={companies} onChange={(e) => setCompanies(e.target.value)} placeholder="ScaleMatic" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Projects (comma-separated)</span>
              <input className={inputCls} value={projects} onChange={(e) => setProjects(e.target.value)} />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Human approval reference (required)</span>
              <input className={inputCls} value={approvalReference} onChange={(e) => setApprovalReference(e.target.value)} placeholder="e.g. approved-by-kalei-2026-06-15" />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-xs text-muted-foreground">Reviewed Markdown (the note body, exactly as approved)</span>
            <textarea className={`${inputCls} min-h-[160px] font-mono`} value={reviewedMarkdown} onChange={(e) => setReviewedMarkdown(e.target.value)} />
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              No auto-filing. Writes one note into 06 Conversations; never overwrites.
            </p>
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground disabled:opacity-40 hover:bg-foreground/10"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
              File Approved Conversation
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {result && rs && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-1.5 ${rs.cls}`}>
              <div className="inline-flex items-center gap-2 font-medium">
                <rs.Icon className="w-4 h-4" />
                {rs.label}
              </div>
              {result.relativePath && (
                <div className="text-xs text-foreground/80">Path: {result.relativePath}</div>
              )}
              {result.reason && <div className="text-xs text-foreground/80">{result.reason}</div>}
              {result.candidates && result.candidates.length > 0 && (
                <div className="text-xs text-foreground/80">
                  Possible duplicates: {result.candidates.join("; ")}
                </div>
              )}
              <div className="text-[11px] text-foreground/50">Audit: {result.auditId}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
