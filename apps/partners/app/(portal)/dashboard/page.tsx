import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, PlusCircle, ArrowRight } from "lucide-react";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository } from "@/server/partnerApps";

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard");
  let apps: any[] = [];
  let authError: string | null = null;
  
  try {
    apps = await partnerAppsRepository.list(token);
  } catch (error: any) {
    if (error.message?.includes("Tenant organization required") || error.data?.message?.includes("Tenant organization required")) {
      authError = "You must create or join a programmer organization to build partner apps.";
    } else {
      authError = "An error occurred while loading your apps.";
      console.error("Dashboard fetch error:", error);
    }
  }
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Partner applications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Register, review, and monitor OAuth clients for Qentrah workspace access.</p>
        </div>
        <Link
          href="/dashboard/apps/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#6b90e6]"
        >
          <PlusCircle className="h-4 w-4" />
          Create a new app
        </Link>
      </div>

      {authError ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[15px] border border-border bg-card p-8 text-center">
          <Boxes className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-foreground">Programmer Organization Required</h3>
          <p className="mt-1 text-sm text-muted-foreground">{authError}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[15px] border border-border bg-card p-8 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No apps found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first app to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, index) => {
            // Alternate patterns based on index
            const patterns = ["pattern-waves", "pattern-grid", "pattern-dots"];
            const pattern = patterns[index % patterns.length];
            
            return (
              <Link
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                className="group flex flex-col overflow-hidden rounded-[15px] border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className={`h-20 w-full bg-primary/10 ${pattern} opacity-70 transition-opacity group-hover:opacity-100`} />
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{app.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {app.clientType === "public" ? "Public App" : "Confidential App"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  
                  <div className="mt-4 mb-4">
                    <p className="font-mono text-xs text-foreground font-medium">
                      {app.clientId ? `${app.clientId.substring(0, 12)}...` : "Pending ID"} <span className="text-muted-foreground font-sans">/ {app.allowedScopes.length} scopes</span>
                    </p>
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {app.status === "active" ? "Active" : "Review"}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      Partner Quota
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
