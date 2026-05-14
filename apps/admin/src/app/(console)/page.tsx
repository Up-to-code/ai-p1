import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { AlertTriangle, Building2, Clock3, Plug, ShieldCheck, UsersRound } from "lucide-react";
import { PageFrame, PageHeader, Panel, PrimaryLink, StatusBadge } from "@/components/ui/admin-primitives";
import { getAdminLocale, statusLabel } from "@/lib/i18n";
import { listAdminDomain } from "@/lib/admin-domain-service";
import type { AdminRecordSummary } from "@/lib/admin-contracts";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  noStore();
  const locale = await getAdminLocale();
  let apps: AdminRecordSummary[] = [];
  let organizations: AdminRecordSummary[] = [];
  let users: AdminRecordSummary[] = [];
  let security: AdminRecordSummary[] = [];
  let loadError: string | null = null;

  try {
    const [appsResponse, organizationsResponse, usersResponse, securityResponse] = await Promise.all([
      listAdminDomain("apps", { limit: 100 }),
      listAdminDomain("organizations", { limit: 100 }),
      listAdminDomain("users", { limit: 100 }),
      listAdminDomain("security", { limit: 20 }),
    ]);
    apps = appsResponse.rows;
    organizations = organizationsResponse.rows;
    users = usersResponse.rows;
    security = securityResponse.rows;
    loadError = appsResponse.warnings[0] ?? organizationsResponse.warnings[0] ?? null;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Admin Convex data could not be loaded.";
  }

  const pending = apps.filter((app) => app.status === "pending").length;
  const approved = apps.filter((app) => app.status === "approved").length;
  const alerts = security.filter((control) => control.status === "danger" || control.status === "warning").length;
  const orgGrowth = monthlySeries(organizations);
  const appGrowth = monthlySeries(apps);

  return (
    <PageFrame>
      <PageHeader
        eyebrow={locale === "ar" ? "لوحة الإدارة" : "Admin"}
        title={locale === "ar" ? "مرحباً" : "Welcome"}
        description={locale === "ar" ? "حالة المنصة في صفحة واحدة: المؤسسات، المستخدمون، طلبات الشركاء، والتنبيهات." : "Platform state in one page: organizations, users, partner reviews, and alerts."}
        action={<PrimaryLink href="/organizations">{locale === "ar" ? "فتح المؤسسات" : "Open organizations"}</PrimaryLink>}
      />

      {loadError ? (
        <Panel tone="warn">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
            <div>
              <h2 className="text-lg font-black">{locale === "ar" ? "تعذر تحميل بعض بيانات الإدارة" : "Some admin data could not load"}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{loadError}</p>
            </div>
          </div>
        </Panel>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StateTile icon={Building2} label={locale === "ar" ? "المؤسسات" : "Organizations"} value={organizations.length} hint={locale === "ar" ? "مساحات عمل فعلية" : "active workspaces"} />
        <StateTile icon={UsersRound} label={locale === "ar" ? "المستخدمون" : "Users"} value={users.length} hint={locale === "ar" ? "ملفات مستخدمين مرصودة" : "observed profiles"} />
        <StateTile icon={Plug} label={locale === "ar" ? "طلبات الشركاء" : "Partner reviews"} value={pending} hint={locale === "ar" ? `${approved} معتمد` : `${approved} approved`} />
        <StateTile icon={ShieldCheck} label={locale === "ar" ? "تنبيهات الأمان" : "Security alerts"} value={alerts} hint={locale === "ar" ? "تحتاج متابعة" : "need attention"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{locale === "ar" ? "النمو" : "Growth"}</p>
              <h2 className="mt-2 text-2xl font-black">{locale === "ar" ? "المؤسسات خلال السنة" : "Organizations this year"}</h2>
              <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
                {locale === "ar" ? "قراءة سريعة لنشاط المؤسسات حسب شهر آخر تحديث. لا يتم تحميل كل السجلات في المتصفح." : "A quick read of organization activity by update month. The browser does not load unbounded records."}
              </p>
            </div>
            <Link href="/organizations" className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
              {locale === "ar" ? "كل المؤسسات" : "All organizations"}
            </Link>
          </div>
          <BarSeries series={orgGrowth} locale={locale} />
        </Panel>

        <Panel>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{locale === "ar" ? "الشركاء" : "Partners"}</p>
          <h2 className="mt-2 text-2xl font-black">{locale === "ar" ? "دورة مراجعة التطبيقات" : "App review lifecycle"}</h2>
          <LifecycleRows
            locale={locale}
            rows={[
              { label: locale === "ar" ? "بانتظار المراجعة" : "Pending review", value: pending, tone: "pending" },
              { label: locale === "ar" ? "معتمدة" : "Approved", value: approved, tone: "active" },
              { label: locale === "ar" ? "مرفوضة أو موقوفة" : "Rejected or suspended", value: apps.filter((app) => app.status === "rejected" || app.status === "suspended").length, tone: "danger" },
            ]}
          />
          <Link href="/apps" className="mt-5 inline-flex h-10 items-center rounded-full bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
            {locale === "ar" ? "فتح التطبيقات" : "Open apps"}
          </Link>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel className="p-0">
          <SectionHead title={locale === "ar" ? "آخر المؤسسات" : "Recent organizations"} description={locale === "ar" ? "ابدأ من المؤسسة، ثم ادخل إلى أعضائها وعملها وسجلها." : "Start from the organization, then drill into members, work, and audit."} />
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {organizations.slice(0, 6).map((org) => (
              <Link key={org.id} href={org.href} className="grid gap-3 p-4 transition hover:bg-zinc-50 dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <span>
                  <span className="block truncate font-black">{org.title === "Organization" ? locale === "ar" ? "مؤسسة مساحة العمل" : "Workspace organization" : org.title}</span>
                  <span className="mt-1 block truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">{organizationSupportLine(org, locale)}</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{locale === "ar" ? "فتح" : "Open"}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="p-0">
          <SectionHead title={locale === "ar" ? "آخر طلبات التطبيقات" : "Recent app submissions"} description={locale === "ar" ? "اسم التطبيق، الناشر، والحالة فقط. التفاصيل داخل المراجعة." : "App name, publisher, and state only. Review details live inside the record."} />
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {apps.slice(0, 6).map((app) => (
              <Link key={app.id} href={app.href} className="grid gap-3 p-4 transition hover:bg-zinc-50 dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <span>
                  <span className="block truncate font-black">{app.title}</span>
                  <span className="mt-1 block truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">{app.fields.find((field) => field.label === "Publisher")?.value ?? app.subtitle}</span>
                </span>
                <StatusBadge value={app.status} label={statusLabel(locale, app.status)} />
              </Link>
            ))}
          </div>
        </Panel>
      </section>

      <Panel>
        <div className="flex items-start gap-3">
          <Clock3 className="mt-1 h-4 w-4 text-zinc-400" />
          <p className="text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
            {locale === "ar" ? "الأرقام هنا مبنية على صفحات محدودة من Convex. عند وجود بيانات أكبر، استخدم البحث والتحميل المرحلي داخل كل نطاق." : "These numbers come from bounded Convex pages. For larger datasets, use search and cursor loading inside each domain."}
          </p>
        </div>
      </Panel>
    </PageFrame>
  );
}

function StateTile({ icon: Icon, label, value, hint }: { icon: typeof Building2; label: string; value: number; hint: string }) {
  return (
    <Panel>
      <Icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
      <p className="mt-5 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-black">{label}</p>
      <p className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">{hint}</p>
    </Panel>
  );
}

function BarSeries({ series, locale }: { series: Array<{ label: string; value: number }>; locale: "en" | "ar" }) {
  const max = Math.max(1, ...series.map((item) => item.value));
  return (
    <div className="mt-8 grid h-56 grid-cols-12 items-end gap-2">
      {series.map((item) => (
        <div key={item.label} className="flex h-full flex-col justify-end gap-2">
          <div className="rounded-t-xl bg-blue-600/85 dark:bg-blue-400" style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }} />
          <span className="text-center text-[10px] font-black text-zinc-400">{monthLabel(item.label, locale)}</span>
        </div>
      ))}
    </div>
  );
}

function LifecycleRows({ rows }: { locale: "en" | "ar"; rows: Array<{ label: string; value: number; tone: "pending" | "active" | "danger" }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="mt-6 space-y-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between gap-3 text-sm font-black">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-white/5">
            <div className={row.tone === "danger" ? "h-2 rounded-full bg-rose-500" : row.tone === "pending" ? "h-2 rounded-full bg-amber-500" : "h-2 rounded-full bg-emerald-500"} style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-zinc-100 p-5 dark:border-white/5">
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function monthlySeries(records: AdminRecordSummary[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), index, 1);
    return {
      label: `${date.getFullYear()}-${String(index + 1).padStart(2, "0")}`,
      value: records.filter((record) => {
        const updated = new Date(record.updatedAt);
        return updated.getFullYear() === date.getFullYear() && updated.getMonth() === index;
      }).length,
    };
  });
}

function monthLabel(value: string, locale: "en" | "ar") {
  const [, month] = value.split("-");
  const index = Number(month) - 1;
  const en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ar = ["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سب", "أكت", "نوف", "ديس"];
  return locale === "ar" ? ar[index] : en[index];
}

function organizationSupportLine(org: AdminRecordSummary, locale: "en" | "ar") {
  const email = org.fields.find((field) => field.label === "Email")?.value;
  const website = org.fields.find((field) => field.label === "Website")?.value;
  if (email) return email;
  if (website) return website;
  if (org.subtitle && !/^[a-z0-9]{16,}$/iu.test(org.subtitle)) return org.subtitle;
  return locale === "ar" ? "ملف المؤسسة غير مكتمل" : "Organization profile incomplete";
}
