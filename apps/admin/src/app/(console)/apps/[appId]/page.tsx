import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowLeft } from "lucide-react";
import { AdminDetailPage } from "@/components/admin-lifecycle";
import { PageFrame, PageHeader, Panel, StatusBadge } from "@/components/ui/admin-primitives";
import { getAdminDomainDetail } from "@/lib/admin-domain-service";
import { getAdminLocale, statusLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PartnerAppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  noStore();
  const locale = await getAdminLocale();
  const { appId } = await params;
  const detail = await getAdminDomainDetail("apps", appId);
  if (!detail) {
    return (
      <PageFrame>
        <BackLink locale={locale} />
        <Panel>{locale === "ar" ? "لم يتم العثور على تطبيق الشريك." : "Partner app was not found."}</Panel>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <BackLink locale={locale} />
      <PageHeader
        eyebrow={locale === "ar" ? "مراجعة تطبيقات الشركاء" : "Partner app review"}
        title={detail.record.title}
        description={detail.record.subtitle}
        action={<StatusBadge value={detail.record.status} label={statusLabel(locale, detail.record.status)} />}
      />
      <AdminDetailPage detail={detail} locale={locale} />
    </PageFrame>
  );
}

function BackLink({ locale }: { locale: "en" | "ar" }) {
  return (
    <Link href="/apps" className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
      <ArrowLeft className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`} />
      {locale === "ar" ? "العودة إلى قائمة المراجعة" : "Back to queue"}
    </Link>
  );
}
