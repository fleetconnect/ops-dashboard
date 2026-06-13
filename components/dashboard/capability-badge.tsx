"use client";

import { cn } from "@/lib/utils";
import type { CapabilityState } from "@/lib/types";
import {
  CheckCircle2,
  AlertTriangle,
  Ban,
  Settings2,
  FlaskConical,
  Database,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Visual mapping for the capability honesty layer. The state and its reason come from the
// backend (real config + verified runtime state); this component only renders them. No state
// is inferred here. "Available" is the only affirmatively green state.
const STATE_STYLE: Record<
  CapabilityState,
  { label: string; icon: LucideIcon; className: string }
> = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/30",
  },
  degraded: {
    label: "Limited",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  not_configured: {
    label: "Not configured",
    icon: Settings2,
    className: "bg-muted text-muted-foreground border-border",
  },
  simulated: {
    label: "Simulated",
    icon: FlaskConical,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  fixture_only: {
    label: "Fixture only",
    icon: Database,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function capabilityLabel(state: CapabilityState): string {
  return STATE_STYLE[state].label;
}

interface CapabilityBadgeProps {
  state: CapabilityState;
  reason?: string;
  label?: string;
  className?: string;
}

export function CapabilityBadge({ state, reason, label, className }: CapabilityBadgeProps) {
  const style = STATE_STYLE[state];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
        style.className,
        className
      )}
      title={reason ?? style.label}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label ? `${label}: ${style.label}` : style.label}
    </span>
  );
}
