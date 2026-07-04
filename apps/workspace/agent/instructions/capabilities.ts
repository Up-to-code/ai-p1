import { defineDynamic, defineInstructions } from "eve/instructions";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { capabilitiesToPermissions, hasPermission, subagentToResource } from "../lib/capabilities";
import type { AgentOrganizationCapabilities } from "../lib/capabilities";

const deniedCapabilities: AgentOrganizationCapabilities = {
  canReadOrganization: false,
  canUpdateOrganization: false,
  canInviteMembers: false,
  canUpdateMembers: false,
  canRemoveMembers: false,
  canReadRoles: false,
  canCreateRoles: false,
  canUpdateRoles: false,
  canDeleteRoles: false,
  canReadClients: false,
  canCreateClients: false,
  canUpdateClients: false,
  canDeleteClients: false,
  canReadProjects: false,
  canCreateProjects: false,
  canUpdateProjects: false,
  canDeleteProjects: false,
  canReadCalendarEvents: false,
  canCreateCalendarEvents: false,
  canUpdateCalendarEvents: false,
  canDeleteCalendarEvents: false,
  canReadTasks: false,
  canCreateTasks: false,
  canUpdateTasks: false,
  canDeleteTasks: false,
  canReadMedia: false,
  canCreateMedia: false,
  canUpdateMedia: false,
  canDeleteMedia: false,
};

export default defineDynamic({
  events: {
    "session.started": async (_event, ctx) => {
      const organizationId = ctx.session.auth.current?.attributes?.organizationId;

      if (!organizationId || typeof organizationId !== "string") return null;

      let capabilities: AgentOrganizationCapabilities;
      try {
        capabilities = await fetchAuthQuery(
          ctx as any,
          api.organizations.profile.access.getCapabilities,
          { organizationId },
        );
      } catch {
        capabilities = deniedCapabilities;
      }

      const permissions = capabilitiesToPermissions(capabilities);

      const availableSubagents = Object.keys(subagentToResource).filter((name) =>
        hasPermission(permissions, subagentToResource[name], "read"),
      );

      const lines: string[] = [
        "## Root tools",
        "",
        "These tools you can call directly:",
        "",
        "- `workspace-search` — search across all workspace entities",
        "- `remember` — store information in session memory",
        "- `list-memories` — list stored session memories",
        "- `forget` — remove a stored memory",
      ];

      if (availableSubagents.length > 0) {
        lines.push(
          "",
          "## Available subagents",
          "",
          `You may delegate to these subagents: \`${availableSubagents.join("`, `")}\``,
          "",
          "Each subagent appears as a tool in your toolkit. Call it by name with a `message` describing the task.",
          "Include all necessary context — the subagent does not see your conversation history.",
        );
      }

      return defineInstructions({ markdown: lines.join("\n") });
    },
  },
});
