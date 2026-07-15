"use client";

import { useRouter } from "@/i18n/routing";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

function dateValue(value?: string) {
  const timestamp = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function ProjectTimelineView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const view = useProjectCollectionView("timeline", savedViewId);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  if (view.projects.length === 0) return <ProjectViewEmpty />;
  const scheduled = view.projects.filter((project) => dateValue(project.startDate) !== undefined || dateValue(project.endDate) !== undefined);
  const timestamps = scheduled.flatMap((project) => [dateValue(project.startDate), dateValue(project.endDate)]).filter((value): value is number => value !== undefined);
  const min = timestamps.length ? Math.min(...timestamps) : 0;
  const max = timestamps.length ? Math.max(...timestamps) : min + 86_400_000;
  const span = Math.max(86_400_000, max - min);
  return (
    <div className="w-full overflow-auto p-4">
      <div className="min-w-[820px] overflow-hidden rounded-xl border border-border bg-card">
        <header className="grid grid-cols-[240px_1fr] border-b border-border bg-muted/30 text-[11px] font-semibold"><div className="px-3 py-2">Project</div><div className="flex justify-between border-s border-border px-3 py-2"><span>{new Date(min).toLocaleDateString()}</span><span className="capitalize text-muted-foreground">{view.config.project?.timelineScale ?? "week"} scale</span><span>{new Date(max).toLocaleDateString()}</span></div></header>
        {scheduled.map((project) => {
          const start = dateValue(project.startDate) ?? dateValue(project.endDate) ?? min;
          const end = dateValue(project.endDate) ?? start + 86_400_000;
          const left = ((start - min) / span) * 100;
          const width = Math.max(2, ((end - start) / span) * 100);
          return <button type="button" key={project.id} onClick={() => router.push(`/projects/${project.id}`)} className="grid min-h-11 w-full grid-cols-[240px_1fr] border-b border-border/50 text-start last:border-b-0 hover:bg-muted/20"><div className="truncate px-3 py-3 text-xs font-semibold">{project.name}</div><div className="relative border-s border-border px-3 py-2"><div className="absolute top-3 h-5 rounded-full bg-primary/20" style={{ insetInlineStart: `${left}%`, width: `${width}%` }}><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress ?? 0}%` }} /></div></div></button>;
        })}
        {view.config.project?.showUnscheduled !== false ? <section className="border-t border-border bg-muted/20 p-3"><h3 className="mb-2 text-[11px] font-semibold text-muted-foreground">Unscheduled</h3><div className="flex flex-wrap gap-2">{view.projects.filter((project) => !project.startDate && !project.endDate).map((project) => <button type="button" key={project.id} onClick={() => router.push(`/projects/${project.id}`)} className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted">{project.name}</button>)}</div></section> : null}
      </div>
    </div>
  );
}
