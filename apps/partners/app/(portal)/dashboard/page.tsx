import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, PlusCircle } from "lucide-react";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Apps</h2>
        <Link
          href="/dashboard/apps/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          Create a new app
        </Link>
      </div>

      {authError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card/40 text-center">
          <Boxes className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-foreground">Programmer Organization Required</h3>
          <p className="mt-1 text-sm text-muted-foreground">{authError}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card/40 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No apps found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first app to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, index) => {
            // Alternate patterns based on index
            const patterns = ["pattern-waves", "pattern-grid", "pattern-dots"];
            const pattern = patterns[index % patterns.length];
            
            return (
              <Link
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className={`h-24 w-full bg-primary/10 ${pattern} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground tracking-tight">{app.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {app.clientType === "public" ? "Public App" : "Confidential App"}
                      </p>
                    </div>
                    <div className="text-muted-foreground hover:text-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                  </div>
                  
                  <div className="mt-4 mb-4">
                    <p className="font-mono text-xs text-foreground font-medium">
                      {app.clientId ? `${app.clientId.substring(0, 12)}...` : "Pending ID"} <span className="text-muted-foreground font-sans">/ {app.allowedScopes.length} scopes</span>
                    </p>
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {app.status === "active" ? "Active" : "Review"}
                    </span>
                    <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
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
