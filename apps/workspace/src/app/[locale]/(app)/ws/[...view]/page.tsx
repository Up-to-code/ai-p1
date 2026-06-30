import { redirect } from "next/navigation";

const VALID_VIEWS = new Set(["overview", "board", "list", "table", "gantt", "calendar"]);

export default async function WsLegacyRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ view: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const viewParam = typeof sp.view === "string" ? sp.view : undefined;

  // Redirect from /ws?view=board to /ws/board
  if (viewParam && VALID_VIEWS.has(viewParam)) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (key === "view") continue;
      if (value) qs.set(key, Array.isArray(value) ? value[0] : value);
    }
    const q = qs.toString();
    redirect(q ? `/ws/${viewParam}?${q}` : `/ws/${viewParam}`);
  }

  // Redirect from /ws/anything to /ws (unknown view)
  redirect("/ws");
}
