// Mirrors the Commercial Opportunity OS backend shapes (scalematic-agents/src/types/opportunity.ts
// and src/types/approval.ts). Kept in sync by hand; the dashboard reads these, never writes them.

export type ThesisStatus = "untested" | "confirmed" | "partial" | "refuted";
export type VerdictType = "APPROVED" | "EDITED" | "REJECTED";
export type ApprovalStatus = "pending" | "approved" | "needs_revision" | "rejected";

export interface OpportunityEvent {
  id: string;
  type: string;
  entityRef?: string;
  subjectId: string;
  parentIds: string[];
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Prediction {
  prediction: "HIGH" | "MEDIUM" | "LOW";
  predicted_thesis: string;
  confidence: number;
}

export interface OpportunityObject {
  id: string;
  entityRef: string;
  interpretationIds: string[];
  signalIds: string[];
  whyNow: string;
  whyUs: string;
  whyThisPerson: string;
  businessProblem: string;
  desiredOutcome: string;
  thesis: string;
  disqualifiersChecked: string[];
  icpFit: number;
  priorityScore: number;
  play: string;
  status: string;
  thesisStatus: ThesisStatus;
  prediction?: Prediction;
  createdAt: string;
}

export interface SignalObject {
  id: string;
  source: string;
  signalType: string;
  entityRefs: string[];
  rawEvidence: string;
  evidenceUrl?: string;
  detectedAt: string;
  confidence: number;
  firstParty: boolean;
  score?: number;
  createdAt: string;
}

export interface InterpretationObject {
  id: string;
  signalIds: string[];
  entityRef: string;
  likelyProblem: string;
  commercialMode: string;
  urgency: { level: "high" | "med" | "low"; driver: string; decayDate?: string };
  budgetInference: { exists: boolean; basis?: string };
  buyingMotion: string;
  trustThreshold: string;
  emotionalState: string;
  confidence: number;
  reasoningTrace: string;
  createdAt: string;
}

// Vertical ancestry chain for one opportunity: signals -> interpretations -> opportunity ->
// downstream events. Mirrors getOpportunityLineage in scalematic-agents/src/opportunity/pipeline.ts.
export interface OpportunityLineage {
  opportunity: OpportunityObject;
  interpretations: InterpretationObject[];
  signals: SignalObject[];
  events: OpportunityEvent[];
}

export interface Approval {
  id: string;
  taskId: string;
  agentId: string;
  output: Record<string, unknown>;
  status: ApprovalStatus;
  createdAt: string;
}

export interface GovernanceOutput {
  status: "approved" | "needs_revision" | "rejected";
  overall_score: number;
  issues: Array<{ type: string; severity: string; excerpt: string; reason: string }>;
  revised_output: string | null;
  reasoning: string;
  approved_for_channels: string[];
}

export interface ReviewContext {
  approval: Approval;
  draft: { message: string | null; subject: string | null; channel: string | null };
  opportunity: OpportunityObject | null;
  governance: GovernanceOutput | null;
  evidence: SignalObject[];
  verdict: VerdictRecord | null;
}

export interface VerdictRecord {
  id: string;
  approvalId: string;
  opportunityId?: string;
  verdict: VerdictType;
  reason?: string;
  beforeText?: string;
  afterText?: string;
  diff?: string;
  decidedBy: string;
  createdAt: string;
}

export interface WeeklyReview {
  windowDays: number;
  generatedAt: string;
  opportunities: { created: number; byThesisStatus: Record<string, number> };
  verdicts: { approved: number; edited: number; rejected: number };
  sends: { sent: number; replied: number };
  thesisConfirmationRate: number | null;
  predictionAccuracy: number | null;
  ratifyPendingInUse: Array<{ id: string; sourceFile: string }>;
}

export interface SystemStatus {
  liveSends: boolean;
  testInboxCount: number;
  instantlyConfigured: boolean;
  judgment: { loaded: boolean; rules: number; presentFiles: number; missingFiles: string[] };
  ratifyPendingInUse: Array<{ id: string; sourceFile: string }>;
  timestamp: string;
}

// ── Capability honesty layer ──────────────────────────────────────
// Mirrors scalematic-agents/src/types/capability.ts. Read-only. The state is derived from
// real configuration and verified runtime state on the backend — never inferred client-side.
export type CapabilityState =
  | "available"
  | "degraded"
  | "blocked"
  | "not_configured"
  | "simulated"
  | "fixture_only"
  | "archived";

export type CapabilityCategory = "runtime" | "integration" | "knowledge" | "ui";

export interface Capability {
  id: string;
  label: string;
  category: CapabilityCategory;
  state: CapabilityState;
  reason: string;
  verifiedAt: string;
}

export interface CapabilityMap {
  capabilities: Capability[];
  generatedAt: string;
}

// ── Vault (Plane B — durable knowledge, read-only) ────────────────
// Mirrors scalematic-agents/src/types/vault.ts. Paths are always vault-relative; absolute
// filesystem paths are never exposed by the backend.
export interface VaultNoteSummary {
  path: string;
  title: string;
  folder: string;
  frontmatter: Record<string, unknown>;
  modifiedAt: string;
}

export interface VaultNote extends VaultNoteSummary {
  body: string;
}

export interface SearchHit {
  path: string;
  title: string;
  folder: string;
  excerpt: string;
  score: number;
}

export interface ProjectSummary {
  path: string;
  title: string;
  status: string | null;
  phase: string | null;
  owner: string | null;
  nextAction: string | null;
  modifiedAt: string;
  staleDays: number;
  frontmatter: Record<string, unknown>;
}

export interface GoalSet {
  found: boolean;
  notes: VaultNoteSummary[];
}

export interface ConversationSummary {
  path: string;
  title: string;
  date: string | null;
  people: string[];
  companies: string[];
  modifiedAt: string;
}

export interface DailyNoteResult {
  found: boolean;
  date: string;
  note: VaultNote | null;
}

export interface VaultStatus {
  configured: boolean;
  reachable: boolean;
  rootLabel: string | null;
  approvedFolders: string[];
  state: CapabilityState;
  reason: string;
}
