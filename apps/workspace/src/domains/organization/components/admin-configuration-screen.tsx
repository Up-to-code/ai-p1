"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";

const destinations: Record<string, string> = {
  "workflows-statuses": "/automations", "custom-fields": "/tasks", templates: "/docs?template=true",
  "portal-branding": "/delivery?view=portal", security: "/organization/custom-permissions",
  "import-export": "/organization", retention: "/organization/search-policy", features: "/organization/admin-config?view=features",
};

export function AdminConfigurationScreen() {
  const t = useTranslations("AdminConfiguration"), requested = useSearchParams().get("view") ?? "features";
  const view = requested in destinations ? requested : "features", href = destinations[view]!;
  return <main className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6"><div className="mx-auto max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">{t("eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold">{t(`views.${view}`)}</h1><section className="mt-6 rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{t(`descriptions.${view}`)}</p>{href !== `/organization/admin-config?view=${view}` ? <WorkspaceLink href={href} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">{t("openOwner")}</WorkspaceLink> : <p className="mt-4 text-xs font-medium text-muted-foreground">{t("featureNote")}</p>}</section></div></main>;
}
