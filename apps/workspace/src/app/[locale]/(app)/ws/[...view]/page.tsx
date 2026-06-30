import { redirect } from "next/navigation";

export default async function WsViewRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ view: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const view = (await params).view[0];
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value) qs.set(key, Array.isArray(value) ? value[0] : value);
  }
  if (view !== "overview") qs.set("view", view);
  const q = qs.toString();
  redirect(q ? `/ws?${q}` : "/ws");
}
