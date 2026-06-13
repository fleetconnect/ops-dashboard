"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SECTION_TITLES, type Section } from "@/lib/os";
import type { StreamStatus } from "@/lib/use-event-stream";
import { api } from "@/lib/api";
import type { Capability, SystemStatus } from "@/lib/types";
import { BADGE_COPY } from "@/lib/copy";
import { GlossaryPanel } from "./glossary-panel";
import { CapabilityBadge } from "./capability-badge";
import { Radio, ShieldCheck, ShieldAlert, HelpCircle } from "lucide-react";

interface HeaderProps {
  activeSection: Section;
  streamStatus: StreamStatus;
}

const streamLabel: Record<StreamStatus, { text: string; dot: string }> = {
  connecting: { text: "connecting", dot: "bg-warning" },
  live: { text: "live", dot: "bg-success" },
  reconnecting: { text: "reconnecting", dot: "bg-destructive" },
};

export function Header({ activeSection, streamStatus }: HeaderProps) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [capabilities, setCapabilities] = useState<Capability[] | null>(null);

  useEffect(() => {
    api.systemStatus().then(setStatus).catch(() => setStatus(null));
    api
      .capabilities()
      .then((m) => setCapabilities(m.capabilities))
      .catch(() => setCapabilities(null));
  }, []);

  const s = streamLabel[streamStatus];
  const judgmentLoaded = status?.judgment.loaded ?? false;
  const sending = status?.liveSends ?? false;

  // Compact posture cluster: surface the two capabilities that gate the whole surface — the
  // reasoning runtime and vault read access. Full detail lives in the Agent Panel.
  const reasoning = capabilities?.find((c) => c.id === "reasoning-runtime");
  const vaultRead = capabilities?.find((c) => c.id === "vault-read");

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">{SECTION_TITLES[activeSection]}</h1>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("w-2 h-2 rounded-full", s.dot)} />
          <span>event stream {s.text}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Read-only operational posture. None of these are editable from the UI. */}
        {/* Sending-off is a SAFETY state, not an error: green-bordered when off (intended). */}
        <span
          className={cn(
            "hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
            sending
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-success/10 text-success border-success/40"
          )}
          title="Controlled by LIVE_SENDS in .env. Never editable from this UI."
        >
          <Radio className="w-3.5 h-3.5 shrink-0" />
          {status ? (sending ? BADGE_COPY.sendingOn : BADGE_COPY.sendingOff) : "Sending status —"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
            judgmentLoaded
              ? "bg-success/10 text-success border-success/30"
              : "bg-warning/10 text-warning border-warning/30"
          )}
          title={
            status
              ? `${status.judgment.presentFiles} rulebook files present, ${status.judgment.missingFiles.length} missing`
              : "rulebook status unknown"
          }
        >
          {judgmentLoaded ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> : <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
          {status
            ? judgmentLoaded
              ? `Business rules loaded (${status.judgment.rules})`
              : BADGE_COPY.judgmentNotLoaded
            : "Business rules —"}
        </span>
        {reasoning && (
          <CapabilityBadge
            state={reasoning.state}
            reason={reasoning.reason}
            label="Reasoning"
            className="hidden xl:inline-flex"
          />
        )}
        {vaultRead && (
          <CapabilityBadge
            state={vaultRead.state}
            reason={vaultRead.reason}
            label="Vault"
            className="hidden xl:inline-flex"
          />
        )}
        <button
          onClick={() => setGlossaryOpen(true)}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="How this system works, in plain English"
          aria-label="Open plain-English glossary"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <GlossaryPanel open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </header>
  );
}
