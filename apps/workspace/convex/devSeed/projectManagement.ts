import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  ensureSavedView,
  ensureSurface,
  ensureSurfaceTab,
} from "../modelization/data";
import { PROJECT_WORKSPACE_SURFACE_KEY } from "../projectWorkspace/data";

const TARGET_EMAIL = "uptocodejs@gmail.com";
const CONFIRMATION = "SEED_DEVELOPMENT_PROJECT_MANAGEMENT_DATA";
const DATASET_MARKER_SLUG = "dev-product-development";

const spaceTemplates = [
  { name: "Product Development", icon: "🚀", color: "#3B82F6", visibility: "public" as const },
  { name: "Client Delivery", icon: "🤝", color: "#10B981", visibility: "public" as const },
  { name: "Design Studio", icon: "🎨", color: "#8B5CF6", visibility: "public" as const },
  { name: "Marketing", icon: "📣", color: "#F97316", visibility: "public" as const },
  { name: "Operations", icon: "⚙️", color: "#64748B", visibility: "request_only" as const },
  { name: "Research & Strategy", icon: "🔭", color: "#EC4899", visibility: "private" as const },
] as const;

const projectNames = [
  ["Qentrah Mobile Launch", "Workspace Navigation 2.0", "Realtime Collaboration", "Performance & Reliability", "Developer Platform"],
  ["Acme Brand Transformation", "Northstar Client Portal", "Atlas Website Rebuild", "Meridian Campaign Delivery", "Summit Analytics Rollout"],
  ["Qentrah Design System", "Mobile Experience Refresh", "Client Portal UX", "Accessibility Excellence", "Motion & Interaction Library"],
  ["Global Product Launch", "Content Engine", "Partner Marketing", "Community Growth", "Lifecycle Campaigns"],
  ["Operating Rhythm", "Security Readiness", "Team Onboarding", "Vendor Consolidation", "Quarterly Planning"],
  ["AI Product Strategy", "Competitive Intelligence", "Customer Discovery", "2027 Portfolio Plan", "Experimentation Program"],
] as const;

const taskVerbs = [
  "Define scope and success metrics",
  "Complete stakeholder interviews",
  "Produce implementation brief",
  "Build the first working increment",
  "Run quality and accessibility review",
  "Validate analytics and reporting",
  "Prepare release communication",
  "Complete launch retrospective",
] as const;

const projectStatuses = ["planned", "active", "paused", "completed", "archived"] as const;
const projectHealth = ["onTrack", "atRisk", "blocked"] as const;
const projectVisibility = ["organization", "space_members", "private", "team", "workspace"] as const;
const taskStatuses = ["todo", "inProgress", "waiting", "done", "canceled"] as const;
const taskPriorities = ["low", "normal", "high", "urgent"] as const;
function slugify(value: string) {
  return `dev-${value.toLowerCase().replace(/&/gu, "and").replace(/[^a-z0-9]+/gu, "-").replace(/(^-|-$)/gu, "")}`;
}

function isoDate(now: number, offsetDays: number) {
  return new Date(now + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

function timestamp(now: number, offsetDays: number, hours = 9) {
  const date = new Date(now + offsetDays * 86_400_000);
  date.setUTCHours(hours, 0, 0, 0);
  return date.getTime();
}

function workOsCustomFields(
  definitionIds: ReadonlyMap<string, Id<"customFieldDefinitions">>,
  userId: string,
  index: number,
  now: number,
) {
  const field = (key: string) => String(definitionIds.get(key));
  return [
    { fieldDefinitionId: field("summary"), fieldKey: "summary", type: "longText" as const, textValue: `Detailed operating context for portfolio item ${index + 1}.` },
    { fieldDefinitionId: field("confidence"), fieldKey: "confidence", type: "number" as const, numberValue: 55 + (index % 5) * 10 },
    { fieldDefinitionId: field("approved_budget"), fieldKey: "approved_budget", type: "currency" as const, currencyValue: 25_000 + index * 1_750 },
    { fieldDefinitionId: field("billable"), fieldKey: "billable", type: "boolean" as const, booleanValue: index % 3 !== 0 },
    { fieldDefinitionId: field("target_launch"), fieldKey: "target_launch", type: "date" as const, dateValue: isoDate(now, 30 + index) },
    { fieldDefinitionId: field("kickoff_at"), fieldKey: "kickoff_at", type: "dateTime" as const, dateTimeValue: new Date(timestamp(now, -10 + index, 10)).toISOString() },
    { fieldDefinitionId: field("portfolio_tier"), fieldKey: "portfolio_tier", type: "select" as const, selectValue: ["strategic", "growth", "maintenance"][index % 3] },
    { fieldDefinitionId: field("disciplines"), fieldKey: "disciplines", type: "multiSelect" as const, multiSelectValue: index % 2 === 0 ? ["design", "engineering"] : ["strategy", "operations"] },
    { fieldDefinitionId: field("lead_user"), fieldKey: "lead_user", type: "user" as const, userValue: userId },
    { fieldDefinitionId: field("brief_url"), fieldKey: "brief_url", type: "url" as const, urlValue: `https://example.test/briefs/${index + 1}` },
  ];
}

const resultValidator = v.object({
  alreadySeeded: v.boolean(),
  spaces: v.number(),
  projects: v.number(),
  tasks: v.number(),
  documents: v.number(),
  calendarEvents: v.number(),
  milestones: v.number(),
  channels: v.number(),
  messages: v.number(),
  savedViews: v.number(),
  notifications: v.number(),
});

/**
 * Creates a deterministic, idempotent development portfolio for the requested
 * Better Auth identity. This is internal-only and requires an explicit safety
 * phrase so it cannot be called from the product client or run accidentally.
 */
export const seedProjectManagementPortfolio = internalMutation({
  args: {
    targetEmail: v.string(),
    targetUserId: v.string(),
    organizationId: v.string(),
    confirmation: v.string(),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    if (args.targetEmail.trim().toLowerCase() !== TARGET_EMAIL || args.confirmation !== CONFIRMATION) {
      throw new Error("Development seed target or confirmation is invalid.");
    }
    const [organization, profile, existingMarker] = await Promise.all([
      ctx.db.query("organizations").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).unique(),
      ctx.db.query("userProfiles").withIndex("by_user_id", (q) => q.eq("userId", args.targetUserId)).unique(),
      ctx.db.query("spaces").withIndex("by_organization_slug", (q) => q.eq("organizationId", args.organizationId).eq("slug", DATASET_MARKER_SLUG)).unique(),
    ]);
    if (!organization) throw new Error("The development Organization was not found.");
    if (!profile) throw new Error("The target development user profile was not found.");
    if (existingMarker) {
      return { alreadySeeded: true, spaces: 0, projects: 0, tasks: 0, documents: 0, calendarEvents: 0, milestones: 0, channels: 0, messages: 0, savedViews: 0, notifications: 0 };
    }

    const now = Date.now();
    const actorUserId = args.targetUserId;
    const counts = { alreadySeeded: false, spaces: 0, projects: 0, tasks: 0, documents: 0, calendarEvents: 0, milestones: 0, channels: 0, messages: 0, savedViews: 0, notifications: 0 };

    const fieldDefinitions = [
      { key: "summary", label: "Portfolio Summary", type: "longText" as const, required: false },
      { key: "confidence", label: "Delivery Confidence", type: "number" as const, required: true, defaultNumberValue: 75 },
      { key: "approved_budget", label: "Approved Budget", type: "currency" as const, required: false, defaultNumberValue: 25_000 },
      { key: "billable", label: "Billable", type: "boolean" as const, required: false, defaultBooleanValue: true },
      { key: "target_launch", label: "Target Launch", type: "date" as const, required: false, defaultDateValue: isoDate(now, 45) },
      { key: "kickoff_at", label: "Kickoff Time", type: "dateTime" as const, required: false },
      { key: "portfolio_tier", label: "Portfolio Tier", type: "select" as const, required: true, defaultSelectValue: "growth", options: ["strategic", "growth", "maintenance"].map((label, order) => ({ id: label, label, order, color: ["purple", "blue", "gray"][order] })) },
      { key: "disciplines", label: "Disciplines", type: "multiSelect" as const, required: false, defaultMultiSelectValue: ["design", "engineering"], options: ["strategy", "design", "engineering", "operations"].map((label, order) => ({ id: label, label, order })) },
      { key: "lead_user", label: "Delivery Lead", type: "user" as const, required: false },
      { key: "brief_url", label: "Source Brief", type: "url" as const, required: false },
    ];
    const definitionIds = new Map<string, Id<"customFieldDefinitions">>();
    for (const [order, definition] of fieldDefinitions.entries()) {
      const id = await ctx.db.insert("customFieldDefinitions", {
        organizationId: args.organizationId,
        scopeType: "workspace",
        key: `dev_${definition.key}`,
        label: definition.label,
        description: `Development seed field covering the ${definition.type} value type.`,
        type: definition.type,
        required: definition.required,
        options: definition.options,
        appliesTo: ["project", "task", "calendarEvent"],
        defaultNumberValue: definition.defaultNumberValue,
        defaultBooleanValue: definition.defaultBooleanValue,
        defaultDateValue: definition.defaultDateValue,
        defaultSelectValue: definition.defaultSelectValue,
        defaultMultiSelectValue: definition.defaultMultiSelectValue,
        order,
        recordState: "active",
        createdByUserId: actorUserId,
        createdAt: now,
        updatedAt: now,
      });
      definitionIds.set(definition.key, id);
    }

    const clientIds: Id<"clients">[] = [];
    const opportunityIds: Id<"opportunities">[] = [];
    for (let index = 0; index < 10; index += 1) {
      const clientId = await ctx.db.insert("clients", {
        organizationId: args.organizationId,
        name: ["Acme", "Northstar", "Atlas", "Meridian", "Summit", "Horizon", "Orbit", "Lumen", "Cedar", "Mosaic"][index],
        type: "organization",
        ownerUserId: actorUserId,
        status: index % 4 === 0 ? "nurture" : "active",
        pipelineStage: index % 2 === 0 ? "qualified" : "active",
        pipelineOrder: index,
        source: "development-seed",
        contact: `Primary stakeholder ${index + 1}`,
        priority: index % 3 === 0 ? "high" : "normal",
        budget: String(50_000 + index * 10_000),
        assetInterest: "Digital product and service transformation",
        added: isoDate(now, -120 + index * 5),
        lastContact: isoDate(now, -index),
        company: `Demo Client ${index + 1}`,
        contactName: `Stakeholder ${index + 1}`,
        website: `https://client-${index + 1}.example.test`,
        notes: "Development-only client reference used by the Project portfolio.",
        tags: ["demo", index % 2 === 0 ? "enterprise" : "growth"],
        visibility: "workspace",
        recordState: "active",
        createdByUserId: actorUserId,
        createdAt: now - index * 86_400_000,
        updatedAt: now - index * 3_600_000,
      });
      clientIds.push(clientId);
      const opportunityId = await ctx.db.insert("opportunities", {
        organizationId: args.organizationId,
        title: `Expansion program ${index + 1}`,
        clientId,
        stage: index % 4 === 0 ? "won" : "proposal",
        status: index % 4 === 0 ? "won" : "open",
        value: 75_000 + index * 12_500,
        currency: index % 3 === 0 ? "EUR" : "USD",
        source: "development-seed",
        priority: taskPriorities[index % taskPriorities.length],
        closeDate: isoDate(now, 15 + index * 3),
        nextStep: "Confirm scope, delivery team, and kickoff date.",
        ownerUserId: actorUserId,
        tags: ["demo", "project-source"],
        customFields: workOsCustomFields(definitionIds, actorUserId, index, now),
        recordState: "active",
        createdByUserId: actorUserId,
        createdAt: now - (index + 20) * 86_400_000,
        updatedAt: now - index * 3_600_000,
      });
      opportunityIds.push(opportunityId);
    }

    const spaceIds: Id<"spaces">[] = [];
    for (const [spaceIndex, template] of spaceTemplates.entries()) {
      const spaceId = await ctx.db.insert("spaces", {
        organizationId: args.organizationId,
        name: template.name,
        description: `Development portfolio for ${template.name.toLowerCase()}, with complete Projects, Tasks, Docs, Calendar, and collaboration data.`,
        icon: template.icon,
        color: template.color,
        slug: spaceIndex === 0 ? DATASET_MARKER_SLUG : slugify(template.name),
        visibility: template.visibility,
        defaultProjectVisibility: spaceIndex === 5 ? "private" : "space_members",
        allowMemberProjectCreation: spaceIndex % 2 === 0,
        recordState: "active",
        createdByUserId: actorUserId,
        createdAt: now - (90 - spaceIndex) * 86_400_000,
        updatedAt: now - spaceIndex * 3_600_000,
      });
      spaceIds.push(spaceId);
      counts.spaces += 1;
      await ctx.db.insert("spaceMembers", {
        organizationId: args.organizationId,
        spaceId,
        userId: actorUserId,
        role: "admin",
        recordState: "active",
        addedByUserId: actorUserId,
        addedAt: now - 80 * 86_400_000,
      });
    }

    for (const [spaceIndex, spaceId] of spaceIds.entries()) {
      const folderId = await ctx.db.insert("docFolders", {
        organizationId: args.organizationId,
        name: `${spaceTemplates[spaceIndex].name} Knowledge Base`,
        icon: spaceTemplates[spaceIndex].icon,
        createdByUserId: actorUserId,
        createdAt: now - 60 * 86_400_000,
        updatedAt: now - spaceIndex * 3_600_000,
      });
      const spaceChannelId = `dev-space-${spaceIndex + 1}`;
      await ctx.db.insert("channels", {
        id: spaceChannelId,
        organizationId: args.organizationId,
        name: `${spaceTemplates[spaceIndex].name} updates`,
        type: "space",
        visibility: templateVisibility(spaceIndex),
        description: "Team announcements, decisions, and weekly operating updates.",
        spaceId: String(spaceId),
        memberIds: [actorUserId],
        createdBy: actorUserId,
        createdAt: now - 45 * 86_400_000,
        updatedAt: now - spaceIndex * 3_600_000,
        unreadCount: spaceIndex % 3,
        lastMessageAt: now - spaceIndex * 3_600_000,
      });
      counts.channels += 1;

      for (let projectIndex = 0; projectIndex < 5; projectIndex += 1) {
        const globalIndex = spaceIndex * 5 + projectIndex;
        const clientId = clientIds[globalIndex % clientIds.length];
        const opportunityId = opportunityIds[globalIndex % opportunityIds.length];
        const status = projectStatuses[globalIndex % projectStatuses.length];
        const projectId = await ctx.db.insert("projects", {
          organizationId: args.organizationId,
          name: projectNames[spaceIndex][projectIndex],
          clientId,
          opportunityId,
          ownerUserId: actorUserId,
          teamMemberIds: [actorUserId],
          status,
          health: projectHealth[globalIndex % projectHealth.length],
          visibility: projectVisibility[globalIndex % projectVisibility.length],
          startDate: isoDate(now, -45 + globalIndex),
          endDate: isoDate(now, 30 + globalIndex * 3),
          budget: 35_000 + globalIndex * 4_250,
          currency: globalIndex % 4 === 0 ? "EUR" : "USD",
          description: `<p><strong>Purpose:</strong> Deliver ${projectNames[spaceIndex][projectIndex]} with measurable outcomes, visible ownership, and a complete operating trail.</p><p>This seeded Project exercises dates, budgets, health, progress, tags, custom fields, linked work, and collaboration.</p>`,
          tags: ["development-seed", spaceTemplates[spaceIndex].name.toLowerCase().replaceAll(" ", "-"), status],
          customFields: workOsCustomFields(definitionIds, actorUserId, globalIndex, now),
          isStrict: globalIndex % 2 === 0,
          isRollupEnabled: globalIndex % 3 !== 0,
          templateId: `dev-template-${(globalIndex % 4) + 1}`,
          progress: status === "completed" ? 100 : status === "planned" ? 10 : 25 + (globalIndex % 4) * 15,
          recordState: "active",
          createdByUserId: actorUserId,
          createdAt: now - (60 - globalIndex) * 86_400_000,
          updatedAt: now - globalIndex * 1_800_000,
        });
        counts.projects += 1;
        await ctx.db.patch(opportunityId, { projectId, updatedAt: now });
        await ctx.db.insert("projectSpaces", {
          organizationId: args.organizationId,
          projectId,
          spaceId,
          isPrimary: true,
          recordState: "active",
          addedByUserId: actorUserId,
          addedAt: now - 50 * 86_400_000,
        });
        await ctx.db.insert("projectMembers", {
          organizationId: args.organizationId,
          projectId,
          userId: actorUserId,
          role: "admin",
          recordState: "active",
          addedByUserId: actorUserId,
          addedAt: now - 50 * 86_400_000,
          updatedAt: now,
        });

        const taskIds: Id<"tasks">[] = [];
        for (let taskIndex = 0; taskIndex < taskVerbs.length; taskIndex += 1) {
          const taskStatus = taskStatuses[(globalIndex + taskIndex) % taskStatuses.length];
          const taskId = await ctx.db.insert("tasks", {
            organizationId: args.organizationId,
            title: `${taskVerbs[taskIndex]} — ${projectNames[spaceIndex][projectIndex]}`,
            status: taskStatus,
            pipelineOrder: taskIndex * 1_000 + globalIndex,
            priority: taskPriorities[(globalIndex + taskIndex) % taskPriorities.length],
            assigneeUserId: actorUserId,
            assigneeUserIds: [actorUserId],
            clientId: String(clientId),
            projectId: String(projectId),
            startDate: isoDate(now, -14 + taskIndex * 3 + projectIndex),
            dueDate: isoDate(now, -4 + taskIndex * 5 + projectIndex),
            description: `<p>Complete the work with documented acceptance criteria, responsible ownership, and a reviewable outcome.</p><ul><li>Confirm scope</li><li>Execute the work</li><li>Record decisions</li></ul>`,
            checklist: [
              { id: `scope-${globalIndex}-${taskIndex}`, title: "Scope confirmed", done: taskIndex > 0 },
              { id: `review-${globalIndex}-${taskIndex}`, title: "Peer review completed", done: taskStatus === "done" },
              { id: `evidence-${globalIndex}-${taskIndex}`, title: "Evidence attached", done: taskStatus === "done" },
            ],
            tags: ["development-seed", taskIndex % 2 === 0 ? "deep-work" : "collaboration"],
            customFields: workOsCustomFields(definitionIds, actorUserId, globalIndex + taskIndex, now),
            visibility: globalIndex % 5 === 0 ? "team" : "workspace",
            spaceId: String(spaceId),
            recordState: "active",
            createdByUserId: actorUserId,
            createdAt: now - (35 - taskIndex) * 86_400_000,
            updatedAt: now - (globalIndex * 8 + taskIndex) * 300_000,
            completedAt: taskStatus === "done" ? now - taskIndex * 86_400_000 : undefined,
          });
          taskIds.push(taskId);
          counts.tasks += 1;
          await ctx.db.insert("taskAssignments", { organizationId: args.organizationId, taskId, userId: actorUserId, isPrimary: true, createdAt: now, updatedAt: now });
        }
        await ctx.db.insert("taskDependencies", {
          organizationId: args.organizationId,
          taskId: String(taskIds[3]),
          dependsOnTaskId: String(taskIds[2]),
          projectId: String(projectId),
          dependencyType: "finish_to_start",
          createdByUserId: actorUserId,
          createdAt: now,
        });

        for (let milestoneIndex = 0; milestoneIndex < 3; milestoneIndex += 1) {
          const milestoneStatus = milestoneIndex === 0 && status !== "planned" ? "completed" : "pending";
          await ctx.db.insert("milestones", {
            organizationId: args.organizationId,
            projectId: String(projectId),
            title: ["Discovery approved", "Working release", "Launch and handoff"][milestoneIndex],
            description: "A measurable Project checkpoint with a named outcome and review date.",
            dueDate: isoDate(now, milestoneIndex * 30 - 10 + projectIndex),
            status: milestoneStatus,
            order: milestoneIndex,
            createdByUserId: actorUserId,
            createdAt: now - 30 * 86_400_000,
            updatedAt: now - milestoneIndex * 3_600_000,
            completedAt: milestoneStatus === "completed" ? now - 5 * 86_400_000 : undefined,
          });
          counts.milestones += 1;
        }

        const documentIds: Id<"docs">[] = [];
        for (let docIndex = 0; docIndex < 2; docIndex += 1) {
          const documentId = await ctx.db.insert("docs", {
            organizationId: args.organizationId,
            title: `${projectNames[spaceIndex][projectIndex]} — ${docIndex === 0 ? "Project brief" : "Decision log"}`,
            content: docIndex === 0
              ? `<h1>Project brief</h1><h2>Outcome</h2><p>Deliver a high-quality result with clear ownership and measurable success criteria.</p><h2>Scope</h2><ul><li>Discovery</li><li>Implementation</li><li>Validation</li><li>Handoff</li></ul>`
              : `<h1>Decision log</h1><table><tr><th>Date</th><th>Decision</th><th>Owner</th></tr><tr><td>${isoDate(now, -7)}</td><td>Use the staged delivery plan.</td><td>${profile.name ?? TARGET_EMAIL}</td></tr></table>`,
            folderId: String(folderId),
            projectId: String(projectId),
            visibility: docIndex === 0 ? "workspace" : "team",
            tags: ["development-seed", docIndex === 0 ? "brief" : "decisions"],
            customFields: [
              { id: `doc-text-${globalIndex}-${docIndex}`, name: "Owner note", type: "text", value: "Keep this current", color: "blue", layout: "half" },
              { id: `doc-number-${globalIndex}-${docIndex}`, name: "Review score", type: "number", value: 80 + (globalIndex % 20), color: "green", layout: "half" },
              { id: `doc-date-${globalIndex}-${docIndex}`, name: "Review date", type: "date", value: isoDate(now, 7), color: "yellow", layout: "half" },
              { id: `doc-select-${globalIndex}-${docIndex}`, name: "Audience", type: "select", value: "Internal", options: ["Internal", "Client"], color: "purple", layout: "half" },
              { id: `doc-status-${globalIndex}-${docIndex}`, name: "Approval", type: "status", value: "In review", options: ["Draft", "In review", "Approved"], color: "orange", layout: "half" },
              { id: `doc-bool-${globalIndex}-${docIndex}`, name: "Canonical", type: "boolean", value: docIndex === 0, color: "gray", layout: "half" },
            ],
            createdByUserId: actorUserId,
            createdAt: now - (20 - docIndex) * 86_400_000,
            updatedAt: now - (globalIndex * 2 + docIndex) * 600_000,
          });
          documentIds.push(documentId);
          counts.documents += 1;
        }

        const eventTypes = ["meeting", "milestone", "focusBlock"] as const;
        for (let eventIndex = 0; eventIndex < eventTypes.length; eventIndex += 1) {
          await ctx.db.insert("calendarEvents", {
            organizationId: args.organizationId,
            title: `${["Weekly project review", "Milestone checkpoint", "Protected focus block"][eventIndex]} — ${projectNames[spaceIndex][projectIndex]}`,
            ownerUserId: actorUserId,
            clientId: String(clientId),
            projectId: String(projectId),
            taskId: String(taskIds[eventIndex]),
            documentId: String(documentIds[eventIndex % documentIds.length]),
            startAt: timestamp(now, -2 + globalIndex + eventIndex * 4, 9 + eventIndex * 2),
            endAt: timestamp(now, -2 + globalIndex + eventIndex * 4, 10 + eventIndex * 2),
            type: eventTypes[eventIndex],
            status: eventIndex === 2 ? "draft" : eventIndex === 1 ? "pending" : "confirmed",
            attendeeUserIds: [actorUserId],
            externalAttendees: [`stakeholder-${(globalIndex % 10) + 1}@example.test`],
            location: eventIndex === 2 ? "Focus room" : "Qentrah Studio",
            meetingUrl: `https://meet.example.test/project-${globalIndex + 1}-${eventIndex + 1}`,
            notes: "Development event with complete Project, Task, Document, Space, attendee, and custom-field links.",
            tags: ["development-seed", "project-calendar"],
            customFields: workOsCustomFields(definitionIds, actorUserId, globalIndex + eventIndex, now),
            spaceId: String(spaceId),
            recordState: "active",
            createdByUserId: actorUserId,
            createdAt: now - 15 * 86_400_000,
            updatedAt: now - eventIndex * 3_600_000,
          });
          counts.calendarEvents += 1;
        }

        await ctx.db.insert("projectDashboards", {
          organizationId: args.organizationId,
          projectId: String(projectId),
          widgetConfig: JSON.stringify(["progress", "health", "tasks", "milestones", "budget"]),
          layout: JSON.stringify([{ id: "progress", x: 0, y: 0, w: 4, h: 2 }, { id: "tasks", x: 4, y: 0, w: 8, h: 4 }]),
          notes: "Development dashboard layout exercising persisted Project widgets.",
          updatedAt: now,
        });

        const projectChannelId = `dev-project-${globalIndex + 1}`;
        await ctx.db.insert("channels", {
          id: projectChannelId,
          organizationId: args.organizationId,
          name: projectNames[spaceIndex][projectIndex],
          type: "project",
          visibility: globalIndex % 4 === 0 ? "private" : "public",
          description: "Project discussion, decisions, updates, and linked work.",
          projectId: String(projectId),
          projectIds: [String(projectId)],
          spaceId: String(spaceId),
          clientId: String(clientId),
          memberIds: [actorUserId],
          createdBy: actorUserId,
          createdAt: now - 30 * 86_400_000,
          updatedAt: now - globalIndex * 600_000,
          unreadCount: globalIndex % 4,
          lastMessageAt: now - globalIndex * 600_000,
        });
        counts.channels += 1;
        const parentMessageId = `dev-message-${globalIndex + 1}-1`;
        for (let messageIndex = 0; messageIndex < 3; messageIndex += 1) {
          const messageId = `dev-message-${globalIndex + 1}-${messageIndex + 1}`;
          await ctx.db.insert("messages", {
            id: messageId,
            clientMessageId: `dev-client-message-${globalIndex + 1}-${messageIndex + 1}`,
            channelId: projectChannelId,
            content: [
              `Weekly update: ${projectNames[spaceIndex][projectIndex]} is moving through the current milestone.`,
              "The implementation brief is ready for review. Please confirm the acceptance criteria.",
              "Decision recorded: proceed with the staged rollout and measure adoption after launch.",
            ][messageIndex],
            authorId: actorUserId,
            createdAt: now - (3 - messageIndex) * 3_600_000,
            updatedAt: now - (3 - messageIndex) * 3_600_000,
            threadId: messageIndex > 0 ? `dev-thread-${globalIndex + 1}` : undefined,
            replyToId: messageIndex > 0 ? parentMessageId : undefined,
            reactions: [{ emoji: messageIndex === 0 ? "👍" : "✅", userIds: [actorUserId] }],
            mentions: [{ type: "project", id: String(projectId), name: projectNames[spaceIndex][projectIndex] }, { type: "task", id: String(taskIds[messageIndex]), name: taskVerbs[messageIndex] }],
            attachments: messageIndex === 1 ? [{ id: `dev-attachment-${globalIndex + 1}`, name: "implementation-brief.pdf", url: "https://example.test/files/implementation-brief.pdf", type: "application/pdf", size: 245_760 }] : [],
            recordState: "active",
            editedAt: messageIndex === 2 ? now - 1_800_000 : undefined,
            pinnedAt: messageIndex === 0 ? now - 2_000_000 : undefined,
            pinnedBy: messageIndex === 0 ? actorUserId : undefined,
          });
          counts.messages += 1;
        }
        await ctx.db.insert("threads", {
          id: `dev-thread-${globalIndex + 1}`,
          channelId: projectChannelId,
          parentMessageId,
          messageCount: 2,
          participantIds: [actorUserId],
          createdAt: now - 2 * 3_600_000,
          updatedAt: now - 3_600_000,
        });

        if (globalIndex < 24) {
          await ctx.db.insert("notificationEvents", {
            organizationId: args.organizationId,
            recipientUserId: actorUserId,
            actorUserId,
            kind: globalIndex % 3 === 0 ? "mentioned" : "task_assigned",
            lane: globalIndex % 4 === 0 ? "other" : "primary",
            disposition: globalIndex % 6 === 0 ? "later" : "active",
            resourceType: globalIndex % 3 === 0 ? "project" : "task",
            resourceId: globalIndex % 3 === 0 ? String(projectId) : String(taskIds[globalIndex % taskIds.length]),
            title: globalIndex % 3 === 0 ? `Mentioned in ${projectNames[spaceIndex][projectIndex]}` : `Task assigned in ${projectNames[spaceIndex][projectIndex]}`,
            body: "A development notification with realistic lane, disposition, read, and linked-resource state.",
            href: globalIndex % 3 === 0 ? `/projects/${projectId}` : `/tasks/${taskIds[globalIndex % taskIds.length]}`,
            dedupeKey: `development-seed-${globalIndex + 1}`,
            readAt: globalIndex % 5 === 0 ? now - 600_000 : undefined,
            deferredAt: globalIndex % 6 === 0 ? now - 300_000 : undefined,
            createdAt: now - globalIndex * 1_800_000,
          });
          counts.notifications += 1;
        }
      }
    }

    const viewSeeds = [
      { viewType: "table" as const, name: "Portfolio Table", icon: "table", config: { sortBy: "updatedAt", sortDirection: "desc" as const, density: "compact" as const, columns: ["name", "status", "health", "progress", "budget", "currency", "startDate", "endDate"].map((id) => ({ id, label: id, visible: true, sortable: true, filterable: true })), columnOrder: ["name", "status", "health", "progress", "budget", "currency", "startDate", "endDate"], columnWidths: { name: 320, status: 140, health: 140, progress: 140, budget: 160 }, columnVisibility: { name: true, status: true, health: true, progress: true, budget: true }, project: { visibleFields: ["name", "status", "health", "progress", "budget", "currency", "startDate", "endDate"] } } },
      { viewType: "list" as const, name: "Projects by Space", icon: "list", config: { groupBy: "space", sortBy: "endDate", sortDirection: "asc" as const, density: "normal" as const, project: { visibleFields: ["name", "status", "health", "ownerUserId", "endDate"] } } },
      { viewType: "board" as const, name: "Status Board", icon: "kanban", config: { groupBy: "status", sortBy: "updatedAt", sortDirection: "desc" as const, filters: [{ id: "active-records", field: "recordState", operator: "equals", value: "active" }], project: { visibleFields: ["name", "health", "progress", "ownerUserId", "endDate"] } } },
      { viewType: "calendar" as const, name: "Launch Calendar", icon: "calendar", config: { sortBy: "startDate", sortDirection: "asc" as const, project: { calendarScale: "week" as const, calendarColorBy: "space" as const, visibleFields: ["name", "startDate", "endDate", "status", "health"] } } },
      { viewType: "timeline" as const, name: "Portfolio Roadmap", icon: "timeline", config: { groupBy: "space", sortBy: "startDate", sortDirection: "asc" as const, project: { timelineScale: "month" as const, showUnscheduled: true, visibleFields: ["name", "startDate", "endDate", "progress", "health"] } } },
      { viewType: "dashboard" as const, name: "Portfolio Dashboard", icon: "dashboard", config: { filters: [{ id: "exclude-archived", field: "status", operator: "notEquals", value: "archived" }], project: { dashboardWidgets: [{ id: "health", widgetType: "project-health", x: 0, y: 0, width: 4, height: 2 }, { id: "progress", widgetType: "portfolio-progress", x: 4, y: 0, width: 4, height: 2 }, { id: "budget", widgetType: "budget-overview", x: 8, y: 0, width: 4, height: 2 }, { id: "timeline", widgetType: "milestone-timeline", x: 0, y: 2, width: 8, height: 4 }, { id: "workload", widgetType: "task-workload", x: 8, y: 2, width: 4, height: 4 }] } } },
    ];
    const surface = await ensureSurface(ctx, { organizationId: args.organizationId, actorUserId, now, seed: { key: PROJECT_WORKSPACE_SURFACE_KEY, title: "Projects", scopeType: "workspace" } });
    for (const [order, seed] of viewSeeds.entries()) {
      const view = await ensureSavedView(ctx, {
        organizationId: args.organizationId,
        actorUserId,
        now,
        seed: { resourceType: "project", viewType: seed.viewType, name: seed.name, description: `Development ${seed.viewType} view with complete persisted configuration.`, scopeType: "workspace", visibility: "organization", config: seed.config, sourceTemplateId: `development:workspace:project-${seed.viewType}` },
      });
      if (view.created) counts.savedViews += 1;
      await ensureSurfaceTab(ctx, { organizationId: args.organizationId, surfaceId: surface.id, actorUserId, savedViewId: view.id, now, seed: { label: seed.name, icon: seed.icon, order: 100 + order * 10, tabType: "savedView", savedViewTemplateId: `development:workspace:project-${seed.viewType}` } });
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId,
      action: "development.project_management.seed",
      target: TARGET_EMAIL,
      summary: `Seeded ${counts.projects} Projects, ${counts.tasks} Tasks, ${counts.documents} Documents, and ${counts.calendarEvents} Calendar events for development.`,
      createdAt: now,
    });

    return counts;
  },
});

function templateVisibility(spaceIndex: number): "public" | "private" {
  return spaceIndex === 5 ? "private" : "public";
}
