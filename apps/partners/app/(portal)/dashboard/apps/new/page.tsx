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
    <div className="space-y-6">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Apps
      </Link>
      
      <div>
        <p className="text-xs font-bold uppercase text-primary">New app</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Create application</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Register credentials, callback URLs, and scopes for review.</p>
      </div>
      
      <div className="max-w-7xl">
        {account?.organization ? (
          <PartnerAppForm />
        ) : (
          <div className="command-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <Boxes className="mb-4 h-8 w-8 text-destructive" />
            <h3 className="text-lg font-medium text-foreground">Programmer organization required</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              You must create or join a programmer organization to build partner apps.
            </p>
            <Link
              href="/dashboard/account"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open account setup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
