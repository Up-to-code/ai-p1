"use client";

import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import type { Project } from "../../store/projects.types";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  status: "Status",
  health: "Health",
  progress: "Progress",
  startDate: "Start",
  endDate: "End",
  budget: "Budget",
  ownerUserId: "Owner",
  updatedAt: "Updated",
};

function fieldValue(project: Project, field: string) {
  const value = project[field as keyof Project];
  if (field === "progress") return `${project.progress ?? 0}%`;
  if (field === "budget") return project.budget == null ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: project.currency ?? "USD", maximumFractionDigits: 0 }).format(project.budget);
  if ((field === "startDate" || field === "endDate") && typeof value === "string") return new Date(value).toLocaleDateString();
  if (field === "updatedAt" && typeof value === "number") return new Date(value).toLocaleDateString();
  return value == null || value === "" ? "—" : String(value);
}

export function ProjectTableView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const view = useProjectCollectionView("table", savedViewId);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  if (view.projects.length === 0) return <ProjectViewEmpty />;
  const fields = view.config.columnOrder ?? view.config.project?.visibleFields ?? ["name", "status", "health", "progress", "startDate", "endDate"];
  const visible = fields.filter((field) => view.config.columnVisibility?.[field] !== false);
  return (
    <div className="min-w-full overflow-auto p-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] border-collapse text-start text-xs">
          <thead className="bg-muted/40 text-muted-foreground"><tr>{visible.map((field) => <th key={field} className="border-b border-border px-3 py-2 text-start font-semibold" style={{ width: view.config.columnWidths?.[field] }}>{FIELD_LABELS[field] ?? field}</th>)}</tr></thead>
          <tbody>{view.projects.map((project) => <tr key={project.id} tabIndex={0} onClick={() => router.push(`/projects/${project.id}`)} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/projects/${project.id}`); }} className={cn("cursor-pointer border-b border-border/50 last:border-b-0 hover:bg-muted/30", view.config.density === "compact" ? "h-9" : "h-11")}>{visible.map((field) => <td key={field} className={cn("px-3", field === "name" && "font-semibold text-foreground")}>{fieldValue(project, field)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
