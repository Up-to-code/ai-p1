import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnerAppForm } from "@/components/forms/PartnerAppForm";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository } from "@/server/partnerApps";

export default async function AppSettingsPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const token = await getToken();
  if (!token) redirect(`/signin?returnTo=${encodeURIComponent(`/dashboard/apps/${appId}/settings`)}`);
  const app = await partnerAppsRepository.getById(token, appId);
  if (!app) notFound();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <Link href={`/dashboard/apps/${appId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to {app.name}
      </Link>
      
      <div className="mb-8 border-b border-border/60 pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Partner program</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">App Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update redirect URIs, publisher metadata, and requested scopes.</p>
      </div>

      <div className="max-w-6xl">
        <PartnerAppForm app={app} mode="edit" />
      </div>
    </div>
  );
}
