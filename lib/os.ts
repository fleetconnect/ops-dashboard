import type { OpportunityEvent } from "./types";

export type Section =
  | "agent-panel"
  | "mission-control"
  | "approval-queue"
  | "opportunities"
  | "lineage"
  | "weekly-review"
  | "agent-status"
  | "recent-notes"
  | "search"
  | "projects"
  | "goals"
  | "conversations"
  | "daily-note"
  | "morning-brief"
  | "integrations";

export const SECTION_TITLES: Record<Section, string> = {
  "agent-panel": "Agent Panel",
  "mission-control": "Mission Control",
  "approval-queue": "Approval Queue",
  opportunities: "Opportunities",
  lineage: "Lineage Explorer",
  "weekly-review": "Weekly Review",
  "agent-status": "Agent Status",
  "recent-notes": "Recent Notes",
  search: "Vault Search",
  projects: "Projects",
  goals: "Goals",
  conversations: "Conversations",
  "daily-note": "Daily Note",
  "morning-brief": "Morning Brief",
  integrations: "Integrations",
};

// Sidebar grouping. Operations = Plane A (live operational state); Knowledge = Plane B
// (durable vault knowledge, read-only in Phase 1); Intelligence = cross-source read-first views.
export type SectionGroup = "operations" | "knowledge" | "intelligence";

export const SECTION_GROUP: Record<Section, SectionGroup> = {
  "morning-brief": "intelligence",
  integrations: "intelligence",
  "agent-panel": "operations",
  "mission-control": "operations",
  "approval-queue": "operations",
  opportunities: "operations",
  lineage: "operations",
  "weekly-review": "operations",
  "agent-status": "operations",
  "recent-notes": "knowledge",
  search: "knowledge",
  projects: "knowledge",
  goals: "knowledge",
  conversations: "knowledge",
  "daily-note": "knowledge",
};

// Human label for each event type rendered in the live feed.
export const EVENT_LABELS: Record<string, string> = {
  "signal.detected": "Signal detected",
  "interpretation.created": "Interpretation created",
  "opportunity.minted": "Opportunity minted",
  "opportunity.killed": "Opportunity killed",
  "message.composed": "Draft composed",
  "message.drafted": "Draft generated",
  "message.submitted_for_approval": "Submitted for approval",
  "message.approved": "Verdict: approved",
  "message.edited": "Verdict: edited",
  "message.rejected": "Verdict: rejected",
  "message.sent": "Message sent",
  "reply.received": "Reply received",
  "conversation.started": "Conversation started",
  "thesis_status.changed": "Thesis status changed",
  "opportunity.closed": "Opportunity closed",
  "outcome.recorded": "Outcome recorded",
};

// Each OS layer derives its state purely from the event types it produces. No agent identity
// is invented; a layer with no matching events has simply never run.
export interface AgentLayer {
  id: string;
  name: string;
  role: string;
  eventTypes: string[];
}

export const AGENT_LAYERS: AgentLayer[] = [
  { id: "sentinel-fmcsa", name: "FMCSA Sentinel", role: "L1 signal detection", eventTypes: ["signal.detected"] },
  { id: "interpreter", name: "Commercial Interpreter", role: "L2 interpretation", eventTypes: ["interpretation.created"] },
  { id: "synthesizer", name: "Opportunity Synthesizer", role: "L3 minting", eventTypes: ["opportunity.minted", "opportunity.killed"] },
  { id: "composer", name: "Composer", role: "Draft generation", eventTypes: ["message.composed", "message.drafted"] },
  { id: "governance", name: "Governance", role: "Pre-approval gate", eventTypes: ["message.submitted_for_approval"] },
  { id: "approval", name: "Approval Queue", role: "Human verdict", eventTypes: ["message.approved", "message.edited", "message.rejected"] },
  { id: "execution", name: "Execution (Instantly)", role: "Send + reply capture", eventTypes: ["message.sent", "reply.received", "conversation.started"] },
  { id: "learning", name: "Learning Layer", role: "Thesis + outcome", eventTypes: ["thesis_status.changed", "outcome.recorded", "opportunity.closed"] },
];

// An event is fixture-sourced when its producer stamped payload.fixture === true (the honest
// seed does exactly that). Used to decide whether to show the FIXTURE DATA banner.
export function isFixtureEvent(event: OpportunityEvent): boolean {
  return event.payload?.fixture === true;
}

export function hasFixtureData(events: OpportunityEvent[]): boolean {
  return events.some(isFixtureEvent);
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
