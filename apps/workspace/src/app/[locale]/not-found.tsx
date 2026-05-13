import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-text-primary sm:px-6">
      <section
        aria-labelledby="not-found-title"
        className="w-full max-w-[720px] overflow-hidden rounded-[24px] border border-border bg-surface text-start shadow-none"
      >
        <div className="border-b border-border bg-background/70 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[12px] font-bold text-primary">Route unavailable</p>
              <p className="text-[12px] font-medium text-text-muted">The requested workspace page is not available.</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <p className="text-[12px] font-bold text-text-muted">Error 404</p>
          <h1 id="not-found-title" className="mt-2 text-[28px] font-bold leading-tight tracking-[0] text-text-primary">
            Page not found
          </h1>
          <p className="mt-3 max-w-[58ch] text-sm font-medium leading-6 text-text-secondary">
            This link may be outdated, or the workspace route may have moved. Open the dashboard to continue from the main operating view.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Link href="/" className="sm:me-auto">
              <Button variant="outline" className="h-10 w-full gap-2 rounded-xl px-4 text-sm sm:w-auto">
                <Home className="h-4 w-4" aria-hidden="true" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="h-10 w-full gap-2 rounded-xl px-4 text-sm shadow-none sm:w-auto">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Open dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
