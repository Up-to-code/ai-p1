/**
 * Canonical domain schemas — single source of truth for domain input shapes.
 *
 * Convex validators and Zod schemas should reference these types to stay aligned.
 * IMPORTANT: These interfaces MUST match the Convex input validators exactly.
 * If you update a Convex validator, update the corresponding interface here.
 */

// ── Deals (matches convex/deals/validators.ts) ─────────

export type DealStage = "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost";
export type DealStatus = "open" | "won" | "lost" | "paused";
export type DealPriority = "low" | "normal" | "high" | "urgent";

export interface DealInput {
  title: string;
  clientId?: string;
  projectId?: string;
  stage: DealStage;
  status: DealStatus;
  value?: number;
  currency?: string;
  dealThinking?: string;
  source?: string;
  priority: DealPriority;
  closeDate?: string;
  nextStep?: string;
  ownerUserId?: string;
  tags?: string[];
}

// ── Projects (matches convex/projects/validators.ts) ──

export type ProjectStatus = "planned" | "active" | "paused" | "completed" | "archived";
export type ProjectHealth = "onTrack" | "atRisk" | "blocked";
export type Visibility = "private" | "team" | "workspace";

export interface ProjectInput {
  name: string;
  clientId?: string;
  opportunityId?: string;
  status: ProjectStatus;
  health: ProjectHealth;
  visibility?: Visibility;
  teamMemberIds?: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  description?: string;
  tags?: string[];
  isStrict?: boolean;
  isRollupEnabled?: boolean;
  templateId?: string;
  customTabs?: string[];
  progress?: number;
}

// ── Clients (matches convex/clients/validators.ts) ─────

export type ClientType = "person" | "organization";
export type ClientStatus = "new" | "active" | "nurture" | "inactive" | "archived";
export type ClientPriority = "normal" | "high" | "urgent";

export interface ClientInput {
  name: string;
  type: ClientType;
  ownerUserId?: string;
  status: ClientStatus;
  pipelineStage?: string;
  pipelineOrder?: number;
  source?: string;
  visibility?: Visibility;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  tags?: string[];
}

// ── Calendar Events (matches convex/calendar/validators.ts) ─

export type CalendarEventType = "meeting" | "deadline" | "reminder" | "milestone" | "focusBlock";
export type CalendarEventStatus = "confirmed" | "pending" | "draft";

export interface CalendarEventInput {
  title: string;
  ownerUserId?: string;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  startAt: number;
  endAt: number;
  type: CalendarEventType;
  status: CalendarEventStatus;
  attendeeUserIds?: string[];
  externalAttendees?: string[];
  location?: string;
  meetingUrl?: string;
  notes?: string;
  tags?: string[];
}

// ── Theories (matches convex/theories/validators.ts) ───

export type TheorySource = "ai_generated" | "user_created";

export interface TheoryInput {
  title: string;
  content: string;
  isPrivate: boolean;
  source: TheorySource;
  category?: string;
  tags?: string[];
}

// ── Tasks (matches convex validators) ──────────────────

export type TaskStatus = "todo" | "inProgress" | "waiting" | "done" | "canceled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface TaskInput {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId?: string;
  clientId?: string;
  projectId?: string;
  dueDate?: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
}
