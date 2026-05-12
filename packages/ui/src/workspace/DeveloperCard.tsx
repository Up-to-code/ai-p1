import { memo } from "react";
import { Building2, MapPin } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";

export type DeveloperCardData = {
  id: string;
  name: string;
  avatarImage?: string;
  avatarLabel: string;
  groupName?: string;
  location?: string;
  badge?: string;
  projectCount?: number;
};

/**
 * WHY:   Developers need a first-class card that conveys brand identity — not a generic person row.
 * WHAT:  Renders a premium card with avatar, name, group name, developer badge, and location.
 * HOW:   Mirrors the BrokerCard aesthetic with a distinctive indigo accent to differentiate the person type at a glance.
 */
const DeveloperCardComponent = ({
  developer,
  className,
}: {
  developer: DeveloperCardData;
  className?: string;
}) => {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:hover:border-slate-700",
        "border-l-[3px] border-l-indigo-500",
        className,
      )}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {developer.avatarImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={developer.avatarImage}
              alt={developer.name}
              className="h-14 w-14 rounded-lg object-cover ring-2 ring-slate-100 transition-shadow group-hover:ring-indigo-100 dark:ring-slate-800 dark:group-hover:ring-indigo-500/30"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-slate-100 text-lg font-black text-slate-500 ring-2 ring-slate-100 dark:from-indigo-500/20 dark:to-slate-800 dark:text-slate-200 dark:ring-slate-800">
              {developer.avatarLabel}
            </div>
          )}
          {/* Developer icon overlay */}
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white dark:border-slate-950">
            <Building2 className="h-2.5 w-2.5" />
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{developer.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Building2 className="h-3 w-3" />
              {developer.badge ?? "مطور"}
            </span>
          </div>

          {/* Group / company name */}
          {developer.groupName && (
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {developer.groupName}
            </p>
          )}

          {/* Location */}
          {developer.location && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" />
              {developer.location}
            </p>
          )}
        </div>
      </div>

      {/* Footer strip */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">مطور عقاري</span>
        </div>
        {developer.projectCount !== undefined && developer.projectCount > 0 && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {developer.projectCount} مشروع
          </span>
        )}
      </div>
    </article>
  );
};

export default memo(DeveloperCardComponent);
