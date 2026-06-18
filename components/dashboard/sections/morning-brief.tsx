"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MorningRevenueBrief } from "@/lib/types";
import { RefreshCw, AlertTriangle, Target, Activity, Users, CalendarClock, Mail, ShieldQuestion, HeartPulse } from "lucide-react";

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

export function MorningBrief() {
  const [brief, setBrief] = useState<MorningRevenueBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBrief(await api.morningBrief());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load morning brief");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {brief ? `Generated ${new Date(brief.generatedAt).toLocaleString()}` : "Read-first morning brief"}
        </span>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {brief && (
        <>
          <Card icon={Target} title="Today's primary focus">
            <div className="text-sm font-medium text-foreground">{brief.primaryFocus.outcome}</div>
            <div className="text-xs text-muted-foreground">{brief.primaryFocus.rationale}</div>
          </Card>

          <Card icon={Activity} title="KPI bottleneck">
            {brief.kpiBottleneck ? (
              <>
                <div className="text-sm text-foreground">{brief.kpiBottleneck.constraint}</div>
                <div className="text-xs text-muted-foreground">{brief.kpiBottleneck.evidence}</div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Not determined — KPI data unavailable or insufficient (not invented).</div>
            )}
          </Card>

          <Card icon={Users} title="Best prospect">
            {brief.bestProspect ? (
              <div className="text-sm text-foreground space-y-1">
                <div>{brief.bestProspect.person ?? "Unknown"}{brief.bestProspect.company ? ` · ${brief.bestProspect.company}` : ""}</div>
                <div className="text-xs text-muted-foreground">{brief.bestProspect.why}</div>
                <div className="text-xs text-muted-foreground">Next: {brief.bestProspect.nextAction} · confidence {brief.bestProspect.confidence}</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No prospect signal from connected sources.</div>
            )}
          </Card>

          <Card icon={ShieldQuestion} title="Revenue at risk">
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Warm: {brief.revenueAtRisk.warmOpportunities.length ? brief.revenueAtRisk.warmOpportunities.join("; ") : "none surfaced"}</li>
              <li>Missing follow-ups: {brief.revenueAtRisk.missingFollowUps.length || 0}</li>
              <li>Open proposals: {brief.revenueAtRisk.openProposals.join("; ")}</li>
              <li>Overdue payments: {brief.revenueAtRisk.overduePayments.join("; ")}</li>
            </ul>
          </Card>

          <Card icon={CalendarClock} title={`Today's meetings (${brief.meetings.length})`}>
            {brief.meetings.length ? (
              <ul className="space-y-2">
                {brief.meetings.map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    <span className="text-foreground">{m.time ? new Date(m.time).toLocaleTimeString() : "—"} · {m.purpose}</span>
                    {m.person ? ` · ${m.person}` : ""}{m.company ? ` (${m.company})` : ""}
                    <div>{m.preCallBrief}</div>
                    <div>Desired: {m.desiredOutcome}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">No meetings (or Calendar not connected).</div>
            )}
          </Card>

          <Card icon={Mail} title={`Follow-ups ready — drafts only (${brief.followUpsReady.length})`}>
            {brief.followUpsReady.length ? (
              <ul className="space-y-2">
                {brief.followUpsReady.map((f, i) => (
                  <li key={i} className="text-xs">
                    <div className="text-foreground">{f.subject} → {f.to}</div>
                    <div className="text-muted-foreground">{f.draft}</div>
                    <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400 mt-1">requires approval · not sent</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">No drafts ready.</div>
            )}
          </Card>

          <Card icon={ShieldQuestion} title="Approvals needed">
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              {brief.approvalsNeeded.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </Card>

          <Card icon={HeartPulse} title="System health">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex flex-wrap gap-2">
                {brief.systemHealth.sources.map((s, i) => (
                  <span key={i} className="inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">
                    {s.connectorId}: {s.state}
                  </span>
                ))}
              </div>
              {brief.systemHealth.missingSources.length > 0 && <div>Missing: {brief.systemHealth.missingSources.join(", ")}</div>}
              {brief.systemHealth.errors.length > 0 && <div className="text-red-400">Errors: {brief.systemHealth.errors.join("; ")}</div>}
            </div>
          </Card>

          <Card icon={Target} title="End-of-day scoreboard">
            <ul className="text-xs text-muted-foreground list-decimal pl-4 space-y-1">
              {brief.endOfDayScoreboard.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Card>

          <div className="text-[11px] text-muted-foreground/70 px-1">
            {brief.inferenceNotes.map((n, i) => <div key={i}>· {n}</div>)}
          </div>
        </>
      )}
    </div>
  );
}
