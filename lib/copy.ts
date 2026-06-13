import type { Section } from "./os";

// ADDENDUM 13 — plain-language layer. Every string here is final copy from the addendum.
// Centralised so the per-screen purpose lines, subtitles, and glossary stay consistent and
// are pasted verbatim, never paraphrased.

// Per-screen purpose line rendered under each section title. `emphasis`, when present, is the
// trailing sentence that should read bolder than the rest (e.g. the Approval Queue "Start here").
export const SECTION_PURPOSE: Record<Section, { text: string; emphasis?: string }> = {
  "approval-queue": {
    text: "Messages the AI has drafted and checked, waiting for a human decision. Nothing sends without one.",
    emphasis: "Start here — this is the only screen that needs you.",
  },
  "mission-control": {
    text: "The system at a glance: what it found, what it drafted, and what you decided this week.",
  },
  opportunities: {
    text: "Every potential deal the system has built, with its reasoning. Mark whether our guess about each one turned out right — that's how the system learns.",
  },
  lineage: {
    text: "Pick anything and see its complete history, step by step. Nothing in this system happens off the record.",
  },
  "weekly-review": {
    text: "Your once-a-week summary: activity, decisions, what the system got right, and anything waiting on the owner.",
  },
  "agent-status": {
    text: "Each part of the system and when it last did its job. Idle is normal — most parts only run when there's work.",
  },
  "agent-panel": {
    text: "Your operator and the agents working under it. Each shows what it can actually do right now — available, limited, or off — and why.",
    emphasis: "Start here — this is the front door to the whole system.",
  },
  "recent-notes": {
    text: "The most recently changed notes in your knowledge vault. Read-only here — the vault stays the source of truth.",
  },
  search: {
    text: "Search across your knowledge vault by title and text. Results link to the note; nothing here changes a file.",
  },
  projects: {
    text: "Active projects pulled from your vault, with status, owner, and next action where you've recorded them.",
  },
  goals: {
    text: "Goals found in your vault. If none are marked yet, that's shown honestly rather than invented.",
  },
  conversations: {
    text: "Conversation notes already filed in your vault — people, companies, and dates as you recorded them.",
  },
  "daily-note": {
    text: "Your daily note for a given day, read straight from the vault. Missing days are shown as missing, not faked.",
  },
};

// First-time-per-screen plain-language subtitles for the brand vocabulary we keep on screen.
export const TERM_SUBTITLE = {
  signal:
    "A real-world event we detected (e.g., a new trucking company was just licensed).",
  interpretation: "What the AI thinks the event means for us.",
  opportunity: "A potential deal, with the reasoning behind it.",
  thesis:
    "Our specific guess about why this company needs us — written down so we can check if we were right.",
  verdict: "Your decision on a drafted message: approve, edit, or reject.",
  lineage: "The full paper trail: every step from detection to decision.",
  governance: "Automated quality and safety checks every message must pass.",
  sentinel: "An always-on watcher for one data source.",
} as const;

// Replacement copy for pure internal jargon (translated outright, not paired).
export const TERM_REPLACE = {
  icpFit: "Customer match", // how closely this company fits who we serve
  prediction: "Our call", // HIGH / MEDIUM / LOW chance this becomes a deal
  ratifyPending: "Rules awaiting owner approval",
} as const;

// Action-consequence copy on the Approval Queue verdict buttons.
export const ACTION_COPY = {
  approveConfirm:
    "This message will be sent to the prospect exactly as written (once sending is on). Your approval is recorded.",
  editConfirm:
    "Your version will be sent instead. Both versions and your reason are saved — edits are how the system learns your judgment.",
  rejectConfirm:
    "Nothing sends. Your reason is recorded and teaches the system what not to draft.",
  reasonPlaceholder: "Why? One honest sentence. This is training data.",
} as const;

// Empty states.
export const EMPTY_STATE = {
  approvalQueue:
    "Nothing waiting on you. New drafts appear here after the system detects an event, builds an opportunity, and passes quality checks.",
  opportunities:
    "No opportunities yet. They appear when a watcher detects something and the AI builds a case for it.",
  eventFeed: "Quiet right now. Events stream here live as the system works.",
  learningMetrics:
    "No decisions recorded yet, so there's nothing to measure. Accuracy appears after your first real verdicts.",
  recentNotes:
    "No notes found in the approved vault folders yet. Once notes exist, the most recently changed appear here.",
  search:
    "No matches. Try a different word — search looks at note titles and text across the approved folders.",
  searchPrompt: "Type a word or phrase to search your vault.",
  projects:
    "No project notes found in the Projects folder yet. Projects appear here once you create them in the vault.",
  goals:
    "No goals are marked in the vault yet. When you tag a note as a goal, it appears here — nothing is invented.",
  conversations:
    "No conversation notes filed yet. Filed conversation notes from the vault appear here.",
  dailyNote:
    "No daily note exists for this day. Pick another date or create the note in your vault.",
} as const;

// Source-of-truth labels for read-only vault (Plane B) sections. Shown so the operator always
// knows these screens read the vault and never write it during Phase 1.
export const VAULT_SOURCE_LABEL = "Source: Obsidian vault (read-only)";

// Status-badge copy.
export const BADGE_COPY = {
  sendingOff: "SENDING OFF — no message can leave this system",
  sendingOn: "SENDING ON — messages can leave this system",
  judgmentNotLoaded:
    "Business rules not loaded — drafting is paused until the rulebook is installed",
  demoBanner:
    "DEMO DATA — these examples show how the system works. No real prospects, no real messages.",
} as const;

// Glossary side panel — "How this system works, in plain English".
export const GLOSSARY_TITLE = "How this system works, in plain English";

export const GLOSSARY_OVERVIEW =
  "This system watches public data for business events, builds a reasoned case when one looks like a potential customer, and drafts the outreach. A human approves, edits, or rejects every message — nothing sends on its own, ever. Every decision is recorded and becomes training data, so the system gradually learns the owner's judgment.";

export const GLOSSARY_TERMS: { term: string; plain: string }[] = [
  { term: "Signal", plain: TERM_SUBTITLE.signal },
  { term: "Interpretation", plain: TERM_SUBTITLE.interpretation },
  { term: "Opportunity", plain: TERM_SUBTITLE.opportunity },
  { term: "Thesis", plain: TERM_SUBTITLE.thesis },
  { term: "Verdict", plain: TERM_SUBTITLE.verdict },
  { term: "Lineage", plain: TERM_SUBTITLE.lineage },
  { term: "Governance gate", plain: TERM_SUBTITLE.governance },
  { term: "Sentinel", plain: TERM_SUBTITLE.sentinel },
  {
    term: "Customer match",
    plain: "How closely this company fits who we serve (replaces “ICP fit”).",
  },
  {
    term: "Our call",
    plain: "Our estimate — HIGH / MEDIUM / LOW — of the chance this becomes a deal.",
  },
  {
    term: "Sending off",
    plain: "A safety state, not an error: no message can leave the system until sending is turned on.",
  },
];
