import { memo } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";
import type { BrokerPresence } from "./BrokerPresenceChip";
import type {
  WorkspacePersonBadge,
  WorkspacePersonCardType,
  WorkspacePersonRelation,
} from "./types";

/**
 * WHY:   Offers and CRM now need one primary person card instead of overloading project cards for every relationship.
 * WHAT:  Renders a compact broker/client card with badges, stage, and linked project or unit context.
 * HOW:   Accepts a serializable person payload so both server pages and client boards can reuse the same card shell.
 */
const PersonCardComponent = function PersonCard({
  person,
  footer,
  compact = true,
}: {
  person: {
    id: string;
    type: WorkspacePersonCardType;
    name: string;
    title?: string;
    avatarImage?: string;
    avatarLabel: string;
    location?: string;
    summary: string;
    stageLabel?: string;
    badges?: WorkspacePersonBadge[];
    relation?: WorkspacePersonRelation | null;
  };
  footer?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-foreground/20",
        compact ? "w-full max-w-[320px]" : "w-full max-w-[360px]"
      )}
    >
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {person.avatarImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={person.avatarImage} alt={person.name} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/20 text-lg font-bold text-muted-foreground">
                {person.avatarLabel}
              </div>
            )}
            {person.badges?.includes("verified") ? (
              <div className="absolute -bottom-1 -left-1 rounded-lg border border-blue-500/20 bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3 w-3" />
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">{person.name}</h3>
              {person.badges?.includes("vip") ? (
                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  VIP
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {person.title ?? (person.type === "broker" ? "وسيط معتمد" : "عميل نشط")}
            </div>
            {person.location ? <div className="mt-1 text-sm text-muted-foreground">{person.location}</div> : null}
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{person.summary}</p>

        <div className="space-y-3 border-t border-border/60 pt-3">
          <div>
            <div className="text-[11px] text-muted-foreground">الارتباط</div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {person.relation?.project?.title ?? "بدون مشروع"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{person.relation?.unit?.label ?? "على مستوى المشروع"}</div>
            {person.relation?.stageLabel ? (
              <div className="mt-1 text-[11px] font-bold text-blue-700">{person.relation.stageLabel}</div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="text-[11px] text-muted-foreground">الحالة</div>
              <div className="mt-1 font-medium text-foreground">{person.stageLabel ?? "قيد المتابعة"}</div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{person.type === "broker" ? "وسيط" : "عميل"}</span>
            </div>
          </div>
        </div>

        {footer ? <div>{footer}</div> : null}
      </div>
    </article>
  );
}

/**
 * WHY:   Existing broker presence data should be promotable into a full person card without repeating field mapping everywhere.
 * WHAT:  Converts a broker-presence chip payload into a `PersonCard`-compatible object.
 * HOW:   Uses optional relation fields when available and falls back to the legacy project title fields.
 */
export function brokerPresenceToPersonCard(broker: BrokerPresence) {
  return {
    id: broker.id,
    type: (broker.personType ?? "broker") as WorkspacePersonCardType,
    name: broker.name,
    title: broker.title,
    avatarImage: broker.avatarImage,
    avatarLabel: broker.avatarLabel,
    location: broker.city,
    summary: broker.summary ?? "يراجع الفرص الحالية والارتباطات المرتبطة به.",
    stageLabel: broker.state === "client-linked" ? "مرتبط بعميل" : broker.state === "qualified" ? "مؤهل" : "بدون عميل",
    badges: broker.badges,
    relation:
      broker.relation ?? {
        project: broker.projectTitle
          ? { id: broker.projectTitle, title: broker.projectTitle, location: broker.city ?? "الرياض" }
          : null,
        unit: broker.unitLabel ? { id: broker.unitLabel, label: broker.unitLabel } : null,
      },
  };
}

export default memo(PersonCardComponent);
