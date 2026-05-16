import { PartnerAppForm } from "@/components/forms/PartnerAppForm";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";
import { ArrowLeft, Boxes } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewAppPage() {
  const token = await getToken().catch(() => null);

  if (!token) {
    redirect("/signin?returnTo=/dashboard/apps/new");
  }

  const account = await partnerAccountRepository.getCurrent(token).catch(() => null);

  return (
    <div>
      <Link href="/dashboard/apps" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Apps
      </Link>
      
      <div className="mb-8 border-b border-border pb-8">
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Create application
        </h1>
      </div>
      
      <div className="max-w-6xl">
        {account?.organization ? (
          <PartnerAppForm />
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[15px] border border-border bg-card p-8 text-center">
            <Boxes className="mb-4 h-8 w-8 text-destructive" />
            <h3 className="text-lg font-medium text-foreground">Programmer Organization Required</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              You must create or join a programmer organization to build partner apps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
