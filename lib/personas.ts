// Static Layer-1 persona config for the Agent Panel, sourced from DASHBOARD.md
// (§Agent Panel, §Agent Architecture, §Agent Roles, §Human Approval Rules). These are the
// cognitive partners the operator works with — NOT invented runtime state. Live status is
// derived from the backend capability map where a persona is actually backed by this system
// (Hermes → reasoning runtime); the other partners are declared roles whose live activity
// Control Center does not track in Phase 1, and we say so honestly rather than faking "Active".

export type PersonaTracking = "orchestrator" | "declared";

export interface Persona {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  allowedTools: string;
  allowedWorkspace: string;
  reviewRequirement: string;
  tracking: PersonaTracking;
  // For the orchestrator, the backend capability id whose real state gates it.
  backsCapabilityId?: string;
}

// Human Approval Rules (DASHBOARD.md) — identical autonomy boundary for every persona.
const REVIEW_REQUIREMENT =
  "May autonomously read approved files, draft, summarize, propose tasks, analyze, flag risks, and recommend. May NOT publish, send, spend, delete/rename/move files, merge records, change rules, or modify live systems without human approval.";

export const PERSONAS: Persona[] = [
  {
    id: "hermes",
    name: "Hermes",
    role: "Operating System / Orchestrator",
    responsibilities: [
      "Vault memory",
      "File operations",
      "Structured workflows",
      "Recurring reviews",
      "Task execution",
      "Performance analysis",
      "Linking and organization",
    ],
    allowedTools: "Vault read (Plane B), structured workflows, recurring reviews, performance analysis",
    allowedWorkspace: "Obsidian vault (read-only in v1) and the operational backend (Plane A)",
    reviewRequirement: REVIEW_REQUIREMENT,
    tracking: "orchestrator",
    backsCapabilityId: "reasoning-runtime",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    role: "General Reasoning Partner",
    responsibilities: [
      "Drafting",
      "Synthesis",
      "Strategic reasoning",
      "Conversation analysis",
      "Research interpretation",
      "Content development",
    ],
    allowedTools: "Reasoning and drafting (no file writes)",
    allowedWorkspace: "Reasoning workspace; outputs returned to the operator, not written to the vault",
    reviewRequirement: REVIEW_REQUIREMENT,
    tracking: "declared",
  },
  {
    id: "claude",
    name: "Claude",
    role: "Deep Analysis Partner",
    responsibilities: [
      "Deep planning",
      "Long-form reasoning",
      "Architecture reviews",
      "Decision support",
      "Complex document analysis",
    ],
    allowedTools: "Long-form reasoning and analysis (no file writes)",
    allowedWorkspace: "Reasoning workspace; outputs returned to the operator, not written to the vault",
    reviewRequirement: REVIEW_REQUIREMENT,
    tracking: "declared",
  },
  {
    id: "coding-agent",
    name: "Coding Agent",
    role: "Technical Execution Partner",
    responsibilities: [
      "Application development",
      "Debugging",
      "Refactoring",
      "Tests",
      "Infrastructure changes",
      "Dashboard implementation",
    ],
    allowedTools: "Code editing, tests, builds (within approved repositories)",
    allowedWorkspace: "Code repositories; changes are reviewed before they reach live systems",
    reviewRequirement: REVIEW_REQUIREMENT,
    tracking: "declared",
  },
];

// Layer-2 runtime execution agents (DASHBOARD.md §Agent Architecture). These are subordinate
// functions Hermes dispatches — NOT first-class panel entities. Surfaced only via the advanced
// toggle (which reuses the event-derived AgentStatus view), never as invented personalities.
export const RUNTIME_AGENTS: string[] = [
  "Strategy",
  "Research",
  "Messaging",
  "Content",
  "Sales",
  "CRM",
  "Ops",
  "Metrics",
  "Governance",
  "Interpreter",
  "Opportunity Synthesizer",
];
