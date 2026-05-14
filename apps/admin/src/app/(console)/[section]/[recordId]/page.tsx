import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowLeft } from "lucide-react";
import { AdminDetailPage } from "@/components/admin-lifecycle";
import { PageFrame, PageHeader, Panel, StatusBadge } from "@/components/ui/admin-primitives";
import { getAdminDomainDetail } from "@/lib/admin-domain-service";
import { findAdminSection } from "@/lib/admin-sections";
import { getAdminLocale, statusLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminRecordDetailPage({ params }: { params: Promise<{ section: string; recordId: string }> }) {
  noStore();
  const locale = await getAdminLocale();
  const { section: sectionId, recordId } = await params;
  const section = findAdminSection(sectionId, locale);
  if (!section) notFound();

  const detail = await getAdminDomainDetail(section.id, recordId);
  if (!detail) {
    return (
      <PageFrame>
        <BackLink href={section.href} locale={locale} />
        <Panel>{locale === "ar" ? "لم يتم العثور على السجل." : "Record was not found."}</Panel>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <BackLink href={section.href} locale={locale} />
      <PageHeader
        eyebrow={section.title}
        title={section.id === "organizations" && detail.record.title.toLowerCase() === "organization"
          ? locale === "ar" ? "مؤسسة مساحة العمل" : "Workspace organization"
          : detail.record.title}
        description={section.id === "organizations"
          ? locale === "ar" ? "ملف المؤسسة التشغيلي: الهوية، الأعضاء، الوصول، البيانات، والسجل." : "Operational organization profile: brand, members, access, data, and register."
          : detail.record.subtitle}
        action={<StatusBadge value={detail.record.status} label={statusLabel(locale, detail.record.status)} />}
      />
      <AdminDetailPage detail={detail} locale={locale} />
    </PageFrame>
  );
}

function BackLink({ href, locale }: { href: string; locale: "en" | "ar" }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
      <ArrowLeft className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`} />
      {locale === "ar" ? "العودة للقائمة" : "Back to list"}
    </Link>
  );
}
