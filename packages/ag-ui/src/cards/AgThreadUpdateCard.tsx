import { ArrowLeftRight, Clock3 } from "lucide-react";

/**
 * WHY:   Offer and collaboration flows often need a concise thread-update snapshot embedded inside the assistant response.
 * WHAT:  Displays sender/recipient context, project scope, status, and the latest thread update.
 * HOW:   Uses stacked metadata rows with a footer status strip for the current thread state.
 */
export default function AgThreadUpdateCard({
  subject,
  sender,
  recipient,
  project,
  unit,
  status,
  update,
}: {
  subject: string;
  sender: string;
  recipient: string;
  project: string;
  unit?: string;
  status: string;
  update: string;
}) {
  return (
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">آخر تحديث على الخيط</div>
          <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{subject}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)]">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">
        <div className="flex items-center justify-between rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2">
          <span>{sender}</span>
          <span className="text-xs text-[var(--workspace-muted)]">المرسل</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2">
          <span>{recipient}</span>
          <span className="text-xs text-[var(--workspace-muted)]">المستلم</span>
        </div>
        <div className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-3">
          <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-muted)]">السياق</div>
          <div className="mt-1">{project}</div>
          <div className="mt-1 text-xs text-[var(--workspace-muted)]">{unit ?? "على مستوى المشروع"}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-4">
        <div className="flex items-center gap-2 text-xs font-black text-[var(--workspace-highlight)]">
          <Clock3 className="h-3.5 w-3.5" />
          {status}
        </div>
        <div className="text-xs font-medium text-[var(--workspace-muted)]">{update}</div>
      </div>
    </section>
  );
}
