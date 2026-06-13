"use client";

import { use } from "react";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";

export default function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(orgId ?? undefined, projectId);

  if (project === undefined) return <div className="p-8">Loading overview...</div>;
  if (project === null) return <div className="p-8 text-red-500">Project not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-2xl font-black">{project.name}</h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {project.description || "No description provided."}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</h4>
            <p className="mt-1 font-semibold">{project.status}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Health</h4>
            <p className="mt-1 font-semibold">{project.health}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Budget</h4>
            <p className="mt-1 font-semibold">{project.budget ? `$${project.budget}` : "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
