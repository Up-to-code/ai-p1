import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

/**
 * WHY:   Action execution needs a lightweight status card that works across hosts and agent flows.
 * WHAT:  Displays a title, description, and status tone for done, running, or blocked execution states.
 * HOW:   Chooses the matching icon and tone class from the `status` prop.
 */
export default function AgExecutionResultCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "done" | "running" | "blocked";
}) {
  const tone =
    status === "done"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      : status === "running"
        ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[var(--workspace-highlight)]"
        : "border-amber-500/25 bg-amber-500/10 text-amber-300";
  const Icon = status === "done" ? CheckCircle2 : status === "running" ? Clock3 : CircleAlert;

  return (
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
          <p className="mt-1 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{description}</p>
        </div>
      </div>
    </section>
  );
}
