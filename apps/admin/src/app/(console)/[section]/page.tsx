import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AdminDataTable } from "@/components/admin-lifecycle";
import { PageFrame, PageHeader, MetricCard, StatusBadge } from "@/components/ui/admin-primitives";
import { listAdminDomain } from "@/lib/admin-domain-service";
import { findAdminSection } from "@/lib/admin-sections";
import { copy, getAdminLocale, statusLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ search?: string; cursor?: string; limit?: string; family?: string; status?: string }>;
}) {
  noStore();
  const locale = await getAdminLocale();
  const { section: sectionId } = await params;
  const query = await searchParams;
  const section = findAdminSection(sectionId, locale);
  if (!section) notFound();

  const response = await listAdminDomain(section.id, {
    search: query.search,
    cursor: query.cursor,
    limit: Number(query.limit ?? 50),
    filters: {
      ...(query.family ? { family: query.family } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });
  const t = copy[locale].sections;

  return (
    <PageFrame>
      <PageHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        action={<StatusBadge value={response.warnings.length > 0 ? "warning" : "active"} label={statusLabel(locale, response.warnings.length > 0 ? "warning" : "active")} />}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label={locale === "ar" ? "الصفحة الحالية" : "Current page"} value={response.rows.length} hint={response.isDone ? t.liveDataState : locale === "ar" ? "يوجد المزيد عبر المؤشر" : "More records available by cursor"} icon={section.icon} />
        <MetricCard label={t.controls} value={section.controls.length} hint={t.allowedActions} icon={section.icon} />
        <MetricCard label={t.trust} value={t.server} hint={t.workspaceApiOnly} icon={section.icon} />
      </div>

      <AdminDataTable response={response} locale={locale} />
    </PageFrame>
  );
}
