import Link from "next/link";
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import { listPartnerApps, type PartnerAppRecord } from "@/lib/hub";

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  suspended: "border-zinc-200 bg-zinc-100 text-zinc-700",
};

export default async function AdminHomePage() {
  let apps: PartnerAppRecord[] = [];
  let loadError: string | null = null;
  try {
    apps = await listPartnerApps();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Hub admin API could not be loaded.";
  }
  const pending = apps.filter((app) => app.status === "pending");
  const approved = apps.filter((app) => app.status === "approved");
  const rejected = apps.filter((app) => app.status === "rejected" || app.status === "suspended");

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Anan Admin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Partner app review</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Review developer submissions, approve production OAuth access, and publish approved apps into Hub integrations.
          </p>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <Stat icon={Clock3} label="Pending" value={pending.length} />
          <Stat icon={CheckCircle2} label="Approved" value={approved.length} />
          <Stat icon={XCircle} label="Closed" value={rejected.length} />
        </div>
      </header>

      <section className="mt-8 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.4fr] border-b border-[var(--border)] px-5 py-3 text-xs font-black uppercase tracking-widest text-[var(--muted)]">
          <span>Application</span>
          <span>Publisher</span>
          <span>Status</span>
          <span className="text-right">Scopes</span>
        </div>
        {loadError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 text-center text-sm font-bold text-rose-700">
            <span>Hub admin API is not connected.</span>
            <span className="max-w-xl text-xs font-medium leading-5 text-[var(--muted)]">{loadError}</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-bold text-[var(--muted)]">
            No partner app submissions found.
          </div>
        ) : (
          apps.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.4fr] items-center border-b border-[var(--border)] px-5 py-4 text-sm last:border-b-0 hover:bg-zinc-50"
            >
              <span>
                <span className="block font-black">{app.name}</span>
                <span className="mt-1 block font-mono text-xs text-[var(--muted)]">{app.oauthClientId}</span>
              </span>
              <span className="font-semibold text-[var(--muted)]">{app.publisherName ?? "Unknown publisher"}</span>
              <span>
                <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-black uppercase ${statusStyles[app.status]}`}>
                  {app.status}
                </span>
              </span>
              <span className="text-right font-black">{app.allowedScopes.length}</span>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: number }) {
  return (
    <div className="min-w-28 rounded-lg border border-[var(--border)] bg-white px-4 py-3">
      <Icon className="mb-2 h-4 w-4 text-[var(--muted)]" />
      <div className="text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{label}</div>
    </div>
  );
}
