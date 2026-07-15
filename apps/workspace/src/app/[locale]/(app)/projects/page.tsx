import { redirect } from "next/navigation";

const LEGACY_VIEW_ROUTES: Record<string, string> = {
  table: "/projects/table",
  list: "/projects/list",
  board: "/projects/board",
  calendar: "/projects/calendar",
  timeline: "/projects/timeline",
  dashboard: "/projects/dashboard",
  portfolio: "/projects/dashboard",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedView = typeof params.view === "string" ? params.view : "table";
  const target = LEGACY_VIEW_ROUTES[requestedView] ?? "/projects/table";
  const next = new URLSearchParams();
  if (typeof params.search === "string") next.set("search", params.search);
  if (typeof params.status === "string") next.set("status", params.status);
  if (params.filter === "at-risk") next.set("health", "atRisk");
  if (params.filter === "my") next.set("member", "me");
  redirect(next.size ? `${target}?${next.toString()}` : target);
}
