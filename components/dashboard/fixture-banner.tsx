"use client";

import { AlertTriangle } from "lucide-react";
import { hasFixtureData } from "@/lib/os";
import { BADGE_COPY } from "@/lib/copy";
import type { OpportunityEvent } from "@/lib/types";

// Shown whenever any event in the live feed was produced by the labeled demo seed
// (payload.fixture === true). The dashboard must never imply live operation it isn't having;
// this banner makes the demo provenance unmissable. It disappears on its own once the live
// pipeline writes real (non-demo) events.
export function FixtureBanner({ events }: { events: OpportunityEvent[] }) {
  if (!hasFixtureData(events)) return null;

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-warning/15 border-b border-warning/40 text-warning text-sm font-medium">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{BADGE_COPY.demoBanner}</span>
    </div>
  );
}
