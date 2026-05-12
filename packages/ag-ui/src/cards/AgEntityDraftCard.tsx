import { BadgeCheck, Building2, Sparkles, UserRound } from "lucide-react";

type DraftField = {
  label: string;
  value: string;
  emphasized?: boolean;
};

const DRAFT_ICONS = {
  person: UserRound,
  offer: BadgeCheck,
  project: Building2,
} as const;

function DraftFieldRow({ field }: { field: DraftField }) {
  const valueClassName = field.emphasized
    ? "mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]"
    : "mt-1 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]";

  return (
    <div className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-3">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-muted)]">{field.label}</div>
      <div className={valueClassName}>{field.value}</div>
    </div>
  );
}

/**
 * WHY:   Draft-driven agent workflows need one shared visual primitive for entity previews across projects, offers, and people.
 * WHAT:  Displays a compact summary card with a title, subtitle, icon, and labeled fields.
 * HOW:   Chooses an icon from `kind`, then renders each field in a consistent bordered cell layout.
 */
export default function AgEntityDraftCard({
  title,
  subtitle,
  fields,
  kind = "project",
}: {
  title: string;
  subtitle: string;
  fields: DraftField[];
  kind?: "project" | "offer" | "person";
}) {
  const Icon = DRAFT_ICONS[kind];

  return (
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-black tracking-[0.28em] text-[var(--workspace-highlight)]">مسودة جاهزة للمراجعة</div>
          <h3 className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
          <p className="text-xs font-medium leading-6 text-[var(--workspace-muted)]">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[var(--workspace-highlight)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {fields.map((field) => <DraftFieldRow key={field.label} field={field} />)}
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">
        <Sparkles className="h-3.5 w-3.5" />
        هذه المسودة يمكن تعديلها أو اعتمادها مباشرة
      </div>
    </section>
  );
}
