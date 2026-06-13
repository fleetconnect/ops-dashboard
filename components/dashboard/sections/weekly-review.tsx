"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { WeeklyReview } from "@/lib/types";
import { EMPTY_STATE, TERM_REPLACE } from "@/lib/copy";
import { Activity, Gavel, GraduationCap, ScrollText, AlertTriangle } from "lucide-react";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
        <Icon className="w-4 h-4 text-accent" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

const WINDOWS = [7, 14, 30];

export function WeeklyReviewSection() {
  const [windowDays, setWindowDays] = useState(7);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReview(null);
    setError(null);
    api.weeklyReview(windowDays).then(setReview).catch((e) => setError(String((e as Error).message ?? e)));
  }, [windowDays]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (!review) {
    return <div className="text-sm text-muted-foreground">Generating review…</div>;
  }

  const v = review.verdicts;
  const totalVerdicts = v.approved + v.edited + v.rejected;
  const overrideRate = totalVerdicts > 0 ? (v.edited + v.rejected) / totalVerdicts : null;
  const thesis = review.opportunities.byThesisStatus;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Auto-generated from the backend. Window covers the last {review.windowDays} days, generated{" "}
          {new Date(review.generatedAt).toLocaleString()}.
        </p>
        <div className="flex items-center gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setWindowDays(w)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                windowDays === w ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {w}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Activity" icon={Activity}>
          <Row label="Opportunities created" value={review.opportunities.created} />
          <Row label="Messages sent" value={review.sends.sent} />
          <Row label="Replies" value={review.sends.replied} />
        </Section>

        <Section title="Governance" icon={Gavel}>
          <Row label="Approvals" value={v.approved} />
          <Row label="Edits" value={v.edited} />
          <Row label="Rejections" value={v.rejected} />
          <Row label="Total verdicts" value={totalVerdicts} />
        </Section>

        <Section title="Learning" icon={GraduationCap}>
          {totalVerdicts === 0 && (
            <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{EMPTY_STATE.learningMetrics}</p>
          )}
          <Row
            label="Prediction accuracy"
            value={
              review.predictionAccuracy != null
                ? `${Math.round(review.predictionAccuracy * 100)}%`
                : `${totalVerdicts === 0 ? "0 verdicts — " : ""}unavailable`
            }
          />
          <Row
            label="Thesis confirmation rate"
            value={
              review.thesisConfirmationRate != null
                ? `${Math.round(review.thesisConfirmationRate * 100)}%`
                : "no resolved theses yet"
            }
          />
          <Row
            label="Human override rate"
            value={overrideRate != null ? `${Math.round(overrideRate * 100)}%` : "0 verdicts — unavailable"}
          />
          <div className="pt-3 text-xs text-muted-foreground">
            Thesis breakdown:{" "}
            {Object.keys(thesis).length === 0
              ? "none"
              : Object.entries(thesis)
                  .map(([k, n]) => `${k} ${n}`)
                  .join(" · ")}
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            Top Edit Reasons and the full prediction-vs-actual chart arrive with the Learning Layer
            (Phase 2). No placeholder curves are shown here.
          </p>
        </Section>

        <Section title="Ratification" icon={ScrollText}>
          <p className="text-xs text-muted-foreground mb-3">
            Registry amendments happen only as versioned changes to the judgment files. This is a
            read-only surfacing of what is pending.
          </p>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {TERM_REPLACE.ratifyPending}
          </div>
          {review.ratifyPendingInUse.length === 0 ? (
            <p className="text-sm text-muted-foreground">None — no rules are awaiting owner approval.</p>
          ) : (
            <ul className="space-y-1.5">
              {review.ratifyPendingInUse.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-xs font-semibold border border-warning/30">
                    {r.id}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{r.sourceFile}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
