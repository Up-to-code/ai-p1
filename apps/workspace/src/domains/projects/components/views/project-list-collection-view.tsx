"use client";

import { useRouter } from "@/i18n/routing";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

export function ProjectListCollectionView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const view = useProjectCollectionView("list", savedViewId);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  if (view.projects.length === 0) return <ProjectViewEmpty />;
  const groupBy = view.config.groupBy ?? "status";
  const groups = new Map<string, typeof view.projects>();
  for (const project of view.projects) {
    const key = String(project[groupBy as keyof typeof project] ?? "Unassigned");
    groups.set(key, [...(groups.get(key) ?? []), project]);
  }
  return (
    <div className="w-full space-y-5 overflow-auto p-4">
      {[...groups.entries()].map(([group, projects]) => (
        <section key={group} className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="flex h-9 items-center justify-between border-b border-border bg-muted/30 px-3"><h2 className="text-xs font-semibold capitalize">{group}</h2><span className="text-[11px] text-muted-foreground">{projects.length}</span></header>
          <div>{projects.map((project) => <button type="button" key={project.id} onClick={() => router.push(`/projects/${project.id}`)} className="grid min-h-11 w-full grid-cols-[minmax(220px,1fr)_120px_100px_110px] items-center gap-3 border-b border-border/50 px-3 text-start text-xs last:border-b-0 hover:bg-muted/30"><span className="truncate font-semibold">{project.name}</span><span className="capitalize text-muted-foreground">{project.health}</span><span>{project.progress ?? 0}%</span><span className="text-muted-foreground">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Unscheduled"}</span></button>)}</div>
        </section>
      ))}
    </div>
  );
}
