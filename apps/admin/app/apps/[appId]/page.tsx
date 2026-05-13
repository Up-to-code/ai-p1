import Link from "next/link";
import type { ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { listPartnerApps, reviewPartnerApp, type PartnerAppStatus } from "@/lib/workspace";

async function reviewAction(formData: FormData) {
  "use server";

  const appId = String(formData.get("appId") ?? "");
  const status = String(formData.get("status") ?? "") as PartnerAppStatus;
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim() || undefined;
  if (!appId || !["approved", "rejected", "suspended"].includes(status)) {
    throw new Error("Invalid review decision.");
  }

  await reviewPartnerApp(appId, { status, reviewNotes });
  revalidatePath("/");
  revalidatePath(`/apps/${appId}`);
  redirect(`/apps/${appId}`);
}

export default async function PartnerAppDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const apps = await listPartnerApps();
  const app = apps.find((candidate) => candidate.id === appId);

  if (!app) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="mt-8 rounded-lg border border-[var(--border)] bg-white p-8">Partner app was not found.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
        <ArrowLeft className="h-4 w-4" />
        Back to queue
      </Link>

      <header className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{app.publisherName ?? "Partner"}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">{app.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{app.description}</p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-black uppercase tracking-widest">
            {app.status}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <Panel title="OAuth client">
            <KeyValue label="Workspace OAuth client ID" value={app.oauthClientId} />
            <KeyValue label="Partners app ID" value={app.partnersAppId ?? "Not linked"} />
            <KeyValue label="Partners client ID" value={app.partnersClientId ?? "Not linked"} />
            <KeyValue label="Partner app URL" value={app.homepageUrl ?? "Not provided"} />
            <KeyValue label="Authorization lifetime" value="14 days" />
          </Panel>

          <Panel title="Redirect URIs">
            <div className="space-y-2">
              {app.redirectUris.map((uri) => (
                <div key={uri} className="break-all rounded-md bg-zinc-50 p-3 font-mono text-xs">{uri}</div>
              ))}
            </div>
          </Panel>

          <Panel title="Scopes">
            <div className="flex flex-wrap gap-2">
              {app.allowedScopes.map((scope) => (
                <span key={scope} className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs font-bold text-zinc-700">
                  {scope}
                </span>
              ))}
            </div>
          </Panel>
        </section>

        <aside className="rounded-lg border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-black">Review decision</h2>
          <form action={reviewAction} className="mt-5 space-y-4">
            <input type="hidden" name="appId" value={app.id} />
            <textarea
              name="reviewNotes"
              defaultValue={app.reviewNotes ?? ""}
              placeholder="Review notes"
              className="min-h-32 w-full resize-y rounded-md border border-[var(--border)] p-3 text-sm outline-none focus:border-zinc-900"
            />
            <DecisionButton status="approved" icon={CheckCircle2} label="Approve app" />
            <DecisionButton status="rejected" icon={XCircle} label="Reject app" />
            <DecisionButton status="suspended" icon={PauseCircle} label="Suspend app" />
          </form>
        </aside>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-[var(--muted)]">{title}</h2>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{label}</div>
      <div className="mt-1 break-all font-mono text-sm">{value}</div>
    </div>
  );
}

function DecisionButton({
  status,
  icon: Icon,
  label,
}: {
  status: PartnerAppStatus;
  icon: typeof CheckCircle2;
  label: string;
}) {
  return (
    <button
      type="submit"
      name="status"
      value={status}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-black text-white hover:bg-zinc-800"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
