"use client";

import type { McpConsentGrantController } from "./use-mcp-consent-grant";

const resourceLabels: Record<string, string> = {
  organization: "Organization", space: "Spaces", project: "Projects", task: "Tasks",
  client: "Clients", deal: "Deals", calendar: "Calendar", media: "Media",
};

export function McpGrantFields({ controller }: { controller: McpConsentGrantController }) {
  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-foreground">
        Access scope
        <select
          value={controller.scopeType}
          onChange={(event) => controller.setScopeType(event.target.value as typeof controller.scopeType)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="organization">Entire organization</option>
          <option value="space">Selected spaces</option>
          <option value="project">Selected projects</option>
        </select>
      </label>

      {controller.scopeType === "space" ? (
        <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-border bg-background p-3">
          {controller.spaces.map((space) => (
            <label key={space.id} className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={controller.selectedSpaceIds.includes(space.id)} onChange={() => controller.toggleId("space", space.id)} />
              {space.name}
            </label>
          ))}
        </div>
      ) : null}

      {controller.scopeType === "project" ? (
        <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-border bg-background p-3">
          {controller.projects.map((project) => (
            <label key={project._id} className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={controller.selectedProjectIds.includes(project._id)} onChange={() => controller.toggleId("project", project._id)} />
              {project.name}
            </label>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full min-w-[390px] text-xs">
          <thead className="bg-muted text-muted-foreground">
            <tr><th className="px-3 py-2 text-start">Resource</th>{controller.actions.map((action) => <th key={action} className="px-2 py-2 capitalize">{action}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {controller.resources.map((resource) => {
              const selected = controller.permissions.find((permission) => permission.resource === resource)?.actions ?? [];
              return (
                <tr key={resource}>
                  <td className="px-3 py-2 font-semibold">{resourceLabels[resource]}</td>
                  {controller.actions.map((action) => (
                    <td key={action} className="px-2 py-2 text-center">
                      <input type="checkbox" checked={selected.includes(action)} onChange={() => controller.togglePermission(resource, action)} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <label className="block text-xs font-bold text-foreground">
        Approval expires after
        <select value={controller.lifetimeDays} onChange={(event) => controller.setLifetimeDays(Number(event.target.value) as 7 | 30 | 90)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
          <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option>
        </select>
      </label>
    </div>
  );
}
