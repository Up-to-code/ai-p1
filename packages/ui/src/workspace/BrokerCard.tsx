import { memo } from "react";
import { ShieldCheck, MapPin } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";
import type { BrokerPresence } from "./BrokerPresenceChip";

const STATE_ACCENT: Record<BrokerPresence["state"], { border: string; dot: string; label: string; text: string }> = {
  "client-linked": {
    border: "border-l-blue-500",
    dot: "bg-blue-500",
    label: "مرتبط بعميل",
    text: "text-blue-700 dark:text-blue-300",
  },
  qualified: {
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    label: "مؤهل",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  idle: {
    border: "border-l-slate-300",
    dot: "bg-slate-400",
    label: "بدون عميل",
    text: "text-slate-500 dark:text-slate-400",
  },
};

/**
 * WHY:   Brokers deserve a dedicated premium card — not a generic person row.
 * WHAT:  Renders a real card with avatar, name, group name, badges, and a coloured status accent.
 * HOW:   Accepts the existing BrokerPresence type so all current data flows straight in.
 */
const BrokerCardComponent = ({
  broker,
  className,
}: {
  broker: BrokerPresence;
  className?: string;
}) => {
  const accent = STATE_ACCENT[broker.state];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:hover:border-slate-700",
        "border-l-[3px]",
        accent.border,
        className,
      )}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {broker.avatarImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={broker.avatarImage}
              alt={broker.name}
              className="h-14 w-14 rounded-lg object-cover ring-2 ring-slate-100 transition-shadow group-hover:ring-blue-100 dark:ring-slate-800 dark:group-hover:ring-blue-500/30"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-slate-100 text-lg font-black text-slate-500 ring-2 ring-slate-100 dark:from-blue-500/20 dark:to-slate-800 dark:text-slate-200 dark:ring-slate-800">
              {broker.avatarLabel}
            </div>
          )}
          {/* Online dot */}
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950",
              accent.dot,
            )}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{broker.name}</h3>
            {broker.badges?.includes("verified") && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                <ShieldCheck className="h-3 w-3" />
                موثق
              </span>
            )}
            {broker.badges?.includes("vip") && (
              <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                VIP
              </span>
            )}
          </div>

          {/* Group / title line */}
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {broker.title ?? "وسيط معتمد"}
          </p>

          {/* Location */}
          {broker.city && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" />
              {broker.city}
            </p>
          )}
        </div>
      </div>

      {/* Status strip */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", accent.dot)} />
          <span className={cn("text-[11px] font-bold", accent.text)}>
            {accent.label}
          </span>
        </div>
        {broker.clientName && (
          <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
            عميل: {broker.clientName}
          </span>
        )}
      </div>
    </article>
  );
};

export default memo(BrokerCardComponent);
