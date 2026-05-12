import { BadgeCheck, Star, UserRound } from "lucide-react";

function StatusBadges({ badges }: { badges: Array<"verified" | "vip"> }) {
  return (
    <>
      {badges.includes("verified") ? (
        <span className="flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-300">
          <BadgeCheck className="h-3 w-3" />
          موثق
        </span>
      ) : null}
      {badges.includes("vip") ? (
        <span className="flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-300">
          <Star className="h-3 w-3" />
          VIP
        </span>
      ) : null}
    </>
  );
}

/**
 * WHY:   Many agent turns need to anchor a person to a project or unit context using a consistent summary card.
 * WHAT:  Displays a person, role, summary, relation, and project/unit context with optional badges.
 * HOW:   Renders the person metadata in a compact profile header followed by relation detail cells.
 */
export default function AgPersonRelationCard({
  name,
  role,
  summary,
  relation,
  project,
  unit,
  badges = [],
}: {
  name: string;
  role: string;
  summary: string;
  relation: string;
  project: string;
  unit?: string;
  badges?: Array<"verified" | "vip">;
}) {
  return (
    <section className="w-full max-w-[300px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,transparent)] text-[var(--workspace-highlight)]">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{name}</h3>
            <StatusBadges badges={badges} />
          </div>
          <div className="mt-1 text-[11px] font-black tracking-[0.18em] text-[var(--workspace-highlight)]">{role}</div>
          <p className="mt-2 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{summary}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-xs font-bold text-[var(--workspace-bubble-other-foreground)]">
        <div className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2">{relation}</div>
        <div className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2">
          {project}
          {unit ? <span className="mr-2 text-[var(--workspace-muted)]">/ {unit}</span> : null}
        </div>
      </div>
    </section>
  );
}
