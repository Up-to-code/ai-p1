import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/";
  redirect(nextPath);
}
