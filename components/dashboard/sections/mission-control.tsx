"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { EVENT_LABELS, isFixtureEvent, relativeTime } from "@/lib/os";
import type { WeeklyReview } from "@/lib/types";
import type { useEventStream } from "@/lib/use-event-stream";
import { EMPTY_STATE, TERM_REPLACE } from "@/lib/copy";
import { Activity, AlertTriangle, Gavel } from "lucide-react";

type Stream = ReturnType<typeof useEventStream>;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground tracking-tight">{value}</div>
    </div>
  );
}

export function MissionControl({ stream }: { stream: Stream }) {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.weeklyReview(7).then(setReview).catch((e) => setError(String((e as Error).message ?? e)));
  }, []);

  const v = review?.verdicts ?? { approved: 0, edited: 0, rejected: 0 };
  const totalVerdicts = v.approved + v.edited + v.rejected;
  const ratify = review?.ratifyPendingInUse ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hero: the single largest number on the screen. */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verdicts this week ({review?.windowDays ?? 7}-day window)
          </div>
          <div className="mt-1 text-6xl font-extrabold tracking-tight text-accent">{totalVerdicts}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-success/10 text-success text-xs font-medium border border-success/30">
              approved {v.approved}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-chart-1/10 text-chart-1 text-xs font-medium border border-chart-1/30">
              edited {v.edited}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/30">
              rejected {v.rejected}
            </span>
          </div>

          {/* ratify_pending rules in active use, listed beneath the hero number. */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              <Gavel className="w-3.5 h-3.5" />
              {TERM_REPLACE.ratifyPending}
            </div>
            {ratify.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                None in active use (or judgment config not loaded).
              </p>
            ) : (
              <ul className="space-y-1.5">
                {ratify.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-xs font-semibold border border-warning/30">
                      {r.id}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{r.sourceFile}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Metric cards from /weekly-review. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Opportunities created" value={review?.opportunities.created ?? 0} />
          <Stat label="Messages sent" value={review?.sends.sent ?? 0} />
          <Stat label="Replies" value={review?.sends.replied ?? 0} />
          <Stat
            label="Thesis confirmation"
            value={
              review?.thesisConfirmationRate != null
                ? `${Math.round(review.thesisConfirmationRate * 100)}%`
                : "n/a"
            }
          />
        </div>

        {review && (
          <p className="font-mono text-xs text-muted-foreground">
            weekly review generated {new Date(review.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <LiveFeed stream={stream} />
    </div>
  );
}

function LiveFeed({ stream }: { stream: Stream }) {
  return (
    <div className="rounded-xl border border-border bg-card flex flex-col h-[calc(100vh-7rem)] sticky top-[4.5rem]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="w-4 h-4 text-accent" />
          Live Event Feed
        </div>
        <span className="text-xs text-muted-foreground">{stream.status}</span>
      </div>
      {stream.events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-6 text-center leading-relaxed">
          {EMPTY_STATE.eventFeed}
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto divide-y divide-border">
          {stream.events.map((e) => (
            <li key={e.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground">{EVENT_LABELS[e.type] ?? e.type}</span>
                <span className="text-xs text-muted-foreground shrink-0">{relativeTime(e.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[11px] text-muted-foreground truncate">{e.subjectId}</span>
                {isFixtureEvent(e) && (
                  <span className="text-[10px] uppercase tracking-wide text-warning font-semibold shrink-0">
                    demo
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
