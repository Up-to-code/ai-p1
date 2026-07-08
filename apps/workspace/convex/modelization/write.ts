import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import {
  ensureSavedView,
  ensureSurface,
  ensureSurfaceTab,
  ensureWorkflowDefinition,
  ensureWorkflowState,
  type SavedViewSeed,
  type SurfaceSeed,
  type SurfaceTabSeed,
  type WorkflowSeed,
} from "./data";
import { seedWorkspaceDefaultsResultValidator } from "./validators";

const WORKFLOW_DEFAULTS: WorkflowSeed[] = [
  {
    resourceType: "task",
    key: "task-status",
    name: "Task Status",
    states: [
      { key: "todo", label: "To Do", color: "#8A8F98", order: 0, category: "not_started", isDefault: true, isRemovable: false },
      { key: "inProgress", label: "In Progress", color: "#2F80ED", order: 1, category: "active", isRemovable: false },
      { key: "waiting", label: "Waiting", color: "#F2A541", order: 2, category: "waiting" },
      { key: "done", label: "Done", color: "#27AE60", order: 3, category: "terminal", isTerminal: true, isRemovable: false },
      { key: "canceled", label: "Canceled", color: "#C44536", order: 4, category: "terminal", isTerminal: true },
    ],
  },
  {
    resourceType: "project",
    key: "project-status",
    name: "Project Status",
    states: [
      { key: "planned", label: "Planned", color: "#8A8F98", order: 0, category: "not_started", isDefault: true, isRemovable: false },
      { key: "active", label: "Active", color: "#2F80ED", order: 1, category: "active", isRemovable: false },
      { key: "paused", label: "Paused", color: "#F2A541", order: 2, category: "waiting" },
      { key: "completed", label: "Completed", color: "#27AE60", order: 3, category: "terminal", isTerminal: true, isRemovable: false },
      { key: "archived", label: "Archived", color: "#6B7280", order: 4, category: "terminal", isTerminal: true },
    ],
  },
  {
    resourceType: "deal",
    key: "deal-stage",
    name: "Deal Stage",
    states: [
      { key: "lead", label: "Lead", color: "#8A8F98", order: 0, category: "not_started", isDefault: true, isRemovable: false },
      { key: "qualified", label: "Qualified", color: "#2F80ED", order: 1, category: "active", isRemovable: false },
      { key: "proposal_sent", label: "Proposal Sent", color: "#7C3AED", order: 2, category: "active" },
      { key: "contract_sent", label: "Contract Sent", color: "#F2A541", order: 3, category: "waiting" },
      { key: "won", label: "Won", color: "#27AE60", order: 4, category: "terminal", isTerminal: true, isRemovable: false },
      { key: "lost", label: "Lost", color: "#C44536", order: 5, category: "terminal", isTerminal: true, isRemovable: false },
    ],
  },
  {
    resourceType: "client",
    key: "client-pipeline",
    name: "Client Pipeline",
    states: [
      { key: "blank", label: "Blank", color: "#B4B2A9", order: 0, category: "not_started", isRemovable: false },
      { key: "new_lead", label: "New Lead", color: "#EF9F27", order: 1, category: "active", isDefault: true, isRemovable: false },
      { key: "attempted", label: "Attempted", color: "#F0997B", order: 2, category: "active" },
      { key: "contacted", label: "Contacted", color: "#378ADD", order: 3, category: "active" },
      { key: "qualified", label: "Qualified", color: "#639922", order: 4, category: "terminal", isTerminal: true },
    ],
  },
];

const SAVED_VIEW_DEFAULTS: SavedViewSeed[] = [
  {
    resourceType: "task",
    viewType: "table",
    name: "All Tasks",
    description: "Default workspace task table.",
    scopeType: "workspace",
    config: { sortBy: "updatedAt", sortDirection: "desc", density: "normal", columnOrder: ["title", "status", "priority", "assigneeUserId", "dueDate"] },
    isDefault: true,
    sourceTemplateId: "default:workspace:task-table",
  },
  {
    resourceType: "task",
    viewType: "board",
    name: "Task Board",
    description: "Default workspace task board grouped by status.",
    scopeType: "workspace",
    config: { groupBy: "status", sortBy: "pipelineOrder", sortDirection: "asc", density: "normal" },
    sourceTemplateId: "default:workspace:task-board",
  },
  {
    resourceType: "project",
    viewType: "table",
    name: "Projects",
    description: "Default workspace project table.",
    scopeType: "workspace",
    config: { sortBy: "updatedAt", sortDirection: "desc", density: "normal", columnOrder: ["name", "status", "health", "ownerUserId", "updatedAt"] },
    isDefault: true,
    sourceTemplateId: "default:workspace:project-table",
  },
  {
    resourceType: "doc",
    viewType: "fileManager",
    name: "Docs",
    description: "Default workspace docs browser.",
    scopeType: "workspace",
    config: { sortBy: "updatedAt", sortDirection: "desc", density: "normal" },
    isDefault: true,
    sourceTemplateId: "default:workspace:docs-file-manager",
  },
  {
    resourceType: "task",
    viewType: "board",
    name: "Project Task Board",
    description: "Default project task board grouped by status.",
    scopeType: "project",
    config: { groupBy: "status", sortBy: "pipelineOrder", sortDirection: "asc", density: "normal" },
    isDefault: true,
    sourceTemplateId: "default:project:task-board",
  },
  {
    resourceType: "doc",
    viewType: "fileManager",
    name: "Project Docs",
    description: "Default project docs tab.",
    scopeType: "project",
    config: { sortBy: "updatedAt", sortDirection: "desc", density: "normal" },
    sourceTemplateId: "default:project:docs-file-manager",
  },
  {
    resourceType: "task",
    viewType: "table",
    name: "Space Tasks",
    description: "Default space task table.",
    scopeType: "space",
    config: { sortBy: "updatedAt", sortDirection: "desc", density: "normal", columnOrder: ["title", "projectId", "status", "assigneeUserId", "dueDate"] },
    isDefault: true,
    sourceTemplateId: "default:space:task-table",
  },
];

const SURFACE_DEFAULTS: Array<SurfaceSeed & { tabs: SurfaceTabSeed[] }> = [
  {
    key: "workspace:home",
    title: "Workspace Home",
    scopeType: "workspace",
    tabs: [
      { label: "Tasks", icon: "list-checks", order: 0, tabType: "savedView", savedViewTemplateId: "default:workspace:task-table" },
      { label: "Projects", icon: "folder-kanban", order: 1, tabType: "savedView", savedViewTemplateId: "default:workspace:project-table" },
      { label: "Docs", icon: "file-text", order: 2, tabType: "savedView", savedViewTemplateId: "default:workspace:docs-file-manager" },
    ],
  },
  {
    key: "space:default:main",
    title: "Space",
    scopeType: "space",
    tabs: [
      { label: "Tasks", icon: "list-checks", order: 0, tabType: "savedView", savedViewTemplateId: "default:space:task-table" },
      { label: "Projects", icon: "folder-kanban", order: 1, tabType: "system", systemKey: "space-projects" },
    ],
  },
  {
    key: "project:default:main",
    title: "Project",
    scopeType: "project",
    tabs: [
      { label: "Board", icon: "kanban", order: 0, tabType: "savedView", savedViewTemplateId: "default:project:task-board" },
      { label: "Docs", icon: "file-text", order: 1, tabType: "savedView", savedViewTemplateId: "default:project:docs-file-manager" },
      { label: "Activity", icon: "activity", order: 2, tabType: "system", systemKey: "project-activity" },
    ],
  },
];

export const seedWorkspaceDefaults = mutation({
  args: { organizationId: v.string() },
  returns: seedWorkspaceDefaultsResultValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    if (!user) throw new Error("Authentication required to seed workspace defaults.");

    const now = Date.now();
    const result = {
      workflowDefinitionsCreated: 0,
      workflowStatesCreated: 0,
      surfacesCreated: 0,
      savedViewsCreated: 0,
      surfaceTabsCreated: 0,
    };

    for (const seed of WORKFLOW_DEFAULTS) {
      const workflow = await ensureWorkflowDefinition(ctx, {
        organizationId: args.organizationId,
        actorUserId: user._id,
        seed,
        now,
      });
      if (workflow.created) result.workflowDefinitionsCreated += 1;

      for (const state of seed.states) {
        const createdState = await ensureWorkflowState(ctx, {
          organizationId: args.organizationId,
          workflowId: workflow.id,
          actorUserId: user._id,
          seed: state,
          sourceTemplateId: `default:${seed.key}:${state.key}`,
          now,
        });
        if (createdState.created) result.workflowStatesCreated += 1;
      }
    }

    const savedViewIds = new Map<string, Awaited<ReturnType<typeof ensureSavedView>>["id"]>();
    for (const seed of SAVED_VIEW_DEFAULTS) {
      const savedView = await ensureSavedView(ctx, {
        organizationId: args.organizationId,
        actorUserId: user._id,
        seed,
        now,
      });
      savedViewIds.set(seed.sourceTemplateId, savedView.id);
      if (savedView.created) result.savedViewsCreated += 1;
    }

    for (const seed of SURFACE_DEFAULTS) {
      const surface = await ensureSurface(ctx, {
        organizationId: args.organizationId,
        actorUserId: user._id,
        seed,
        now,
      });
      if (surface.created) result.surfacesCreated += 1;

      for (const tab of seed.tabs) {
        const savedViewId = tab.savedViewTemplateId ? savedViewIds.get(tab.savedViewTemplateId) : undefined;
        const createdTab = await ensureSurfaceTab(ctx, {
          organizationId: args.organizationId,
          surfaceId: surface.id,
          actorUserId: user._id,
          seed: tab,
          savedViewId,
          now,
        });
        if (createdTab.created) result.surfaceTabsCreated += 1;
      }
    }

    return result;
  },
});
