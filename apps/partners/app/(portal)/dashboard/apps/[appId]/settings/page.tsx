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
    <div>
      <Link href={`/dashboard/apps/${appId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to {app.name}
      </Link>
      
      <div className="mb-8 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase text-primary">Partner program</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">App settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update redirect URIs, publisher metadata, and requested scopes.</p>
      </div>

      <div className="max-w-6xl">
        <PartnerAppForm app={app} mode="edit" />
      </div>
    </div>
  );
}
