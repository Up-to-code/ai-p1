import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function PendingApprovalBanner() {
  const t = useTranslations("Common");

  return (
    <div className="w-full h-[var(--top-banner-height)] bg-amber-50 border-b border-amber-200/50 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-900 z-50 relative shrink-0">
      <AlertCircle className="w-3.5 h-3.5" />
      {t("pendingApproval") || "Verification in progress"}
    </div>
  );
}
