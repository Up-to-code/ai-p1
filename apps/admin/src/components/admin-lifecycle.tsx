"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Bell, Building2, CalendarDays, Database, KeyRound, Search, UsersRound } from "lucide-react";
import type { AdminAction, AdminAuditEvent, AdminDetailResponse, AdminListResponse, AdminRecordSummary } from "@/lib/admin-contracts";
import { cn } from "@/lib/utils";
import { Panel, StatusBadge } from "./ui/admin-primitives";

type Locale = "en" | "ar";

function text(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

export function AdminDataTable({ response, locale }: { response: AdminListResponse; locale: Locale }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return response.rows;
    return response.rows.filter((row) => `${row.title} ${row.subtitle} ${row.status}`.toLowerCase().includes(normalized));
  }, [query, response.rows]);
  const nextHref = useMemo(() => {
    if (response.isDone || !response.continueCursor) return null;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", response.continueCursor);
    params.set("limit", String(response.pageSize));
    return `${pathname}?${params.toString()}`;
  }, [pathname, response.continueCursor, response.isDone, response.pageSize, searchParams]);

  if (response.domain === "organizations") {
    return <OrganizationCards response={response} rows={rows} locale={locale} nextHref={nextHref} query={query} setQuery={setQuery} applySearch={() => applySearch(pathname, searchParams, router, query)} />;
  }

  if (response.domain === "apps" || response.domain === "oauth-clients") {
    return <PartnerAppCards response={response} rows={rows} locale={locale} nextHref={nextHref} query={query} setQuery={setQuery} applySearch={() => applySearch(pathname, searchParams, router, query)} />;
  }

  if (response.domain === "audit-logs") {
    return <AuditConsoleList response={response} rows={rows} locale={locale} nextHref={nextHref} query={query} setQuery={setQuery} applySearch={() => applySearch(pathname, searchParams, router, query)} />;
  }

  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 dark:border-white/5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black">{text(locale, "Records", "السجلات")}</h2>
          <p className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {response.rows.length} {text(locale, "items on this bounded page", "عنصر في هذه الصفحة المحددة")}
          </p>
        </div>
        <label className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch(pathname, searchParams, router, query);
            }}
            placeholder={text(locale, "Search records", "بحث في السجلات")}
            className="h-10 w-full rounded-full border border-zinc-100 bg-zinc-50 pe-4 ps-10 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
          />
        </label>
      </div>
      <div className="grid min-w-[760px] grid-cols-[1.2fr_0.6fr_1fr_0.4fr] border-b border-zinc-100 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:border-white/5">
        <span>{text(locale, "Record", "السجل")}</span>
        <span>{text(locale, "Status", "الحالة")}</span>
        <span>{text(locale, "Fields", "الحقول")}</span>
        <span className="text-end">{text(locale, "Open", "فتح")}</span>
      </div>
      <div className="overflow-x-auto">
        {response.warnings.length > 0 ? (
          <div className="border-b border-amber-400/20 bg-amber-50 px-5 py-3 text-xs font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
            {response.warnings.join(" ")}
          </div>
        ) : null}
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm font-black text-zinc-500 dark:text-zinc-400">
            {text(locale, "No records match this view.", "لا توجد سجلات تطابق هذا العرض.")}
          </div>
        ) : (
          rows.map((row) => <AdminTableRow key={row.id} row={row} locale={locale} />)
        )}
      </div>
      {nextHref ? (
        <div className="border-t border-zinc-100 p-4 text-end dark:border-white/5">
          <Link href={nextHref} className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
            {text(locale, "Next page", "الصفحة التالية")}
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}

function OrganizationCards({
  response,
  rows,
  locale,
  nextHref,
  query,
  setQuery,
  applySearch,
}: {
  response: AdminListResponse;
  rows: AdminRecordSummary[];
  locale: Locale;
  nextHref: string | null;
  query: string;
  setQuery: (value: string) => void;
  applySearch: () => void;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black">{text(locale, "Organizations", "المؤسسات")}</h2>
          <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
            {text(locale, "Search by name, legal name, email, or organization ID.", "ابحث بالاسم أو الاسم القانوني أو البريد أو معرف المؤسسة.")}
          </p>
        </div>
        <div className="flex w-full gap-2 lg:w-[420px]">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder={text(locale, "Organization name or ID", "اسم المؤسسة أو المعرف")}
              className="h-10 w-full rounded-full border border-zinc-100 bg-zinc-50 pe-4 ps-10 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
            />
          </label>
          <button type="button" onClick={applySearch} className="h-10 rounded-full bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white dark:bg-white dark:text-zinc-950">
            {text(locale, "Search", "بحث")}
          </button>
        </div>
      </div>
      {response.warnings.length > 0 ? (
        <div className="border-b border-amber-400/20 bg-amber-50 px-5 py-3 text-xs font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          {response.warnings.join(" ")}
        </div>
      ) : null}
      <div className="divide-y divide-zinc-100 dark:divide-white/5">
        {rows.map((org, index) => (
          <Link key={org.id} href={org.href} className="grid gap-4 p-4 transition hover:bg-zinc-50 dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <LogoMark name={org.title} imageUrl={org.fields.find((field) => field.label === "Logo")?.value} index={index} />
              <div className="min-w-0">
                <p className="truncate text-base font-black">{cleanTitle(org.title, locale)}</p>
                <p className="mt-1 truncate text-sm font-bold text-zinc-500 dark:text-zinc-400">{organizationSupportLine(org, locale)}</p>
                <OrganizationMeta org={org} locale={locale} />
              </div>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{formatRelative(org.updatedAt, locale)}</span>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{text(locale, "Open", "فتح")}</span>
            </div>
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="p-12 text-center text-sm font-black text-zinc-500 dark:text-zinc-400">
          {text(locale, "No organizations match this view.", "لا توجد مؤسسات تطابق هذا العرض.")}
        </div>
      ) : null}
      {nextHref ? (
        <div className="border-t border-zinc-100 p-4 text-end dark:border-white/5">
          <Link href={nextHref} className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
            {text(locale, "Load more", "تحميل المزيد")}
          </Link>
        </div>
      ) : null}
    </Panel>
  );
}

function PartnerAppCards({
  response,
  rows,
  locale,
  nextHref,
  query,
  setQuery,
  applySearch,
}: {
  response: AdminListResponse;
  rows: AdminRecordSummary[];
  locale: Locale;
  nextHref: string | null;
  query: string;
  setQuery: (value: string) => void;
  applySearch: () => void;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <ListHeader
        locale={locale}
        title={text(locale, "Partner apps", "تطبيقات الشركاء")}
        description={text(locale, "Submitted apps, publisher identity, logos, scopes, and review state.", "التطبيقات المقدمة وهوية الناشر والشعار والصلاحيات وحالة المراجعة.")}
        query={query}
        setQuery={setQuery}
        applySearch={applySearch}
        placeholder={text(locale, "App, publisher, client ID", "التطبيق أو الناشر أو معرف العميل")}
      />
      <div className="divide-y divide-zinc-100 dark:divide-white/5">
        {rows.map((app, index) => (
          <Link key={app.id} href={app.href} className="grid gap-4 p-4 transition hover:bg-zinc-50 dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <LogoMark name={app.title} imageUrl={app.fields.find((field) => field.label === "Logo")?.value} index={index + 12} />
              <div className="min-w-0">
                <p className="truncate text-base font-black">{app.title}</p>
                <p className="mt-1 truncate text-sm font-bold text-zinc-500 dark:text-zinc-400">{app.fields.find((field) => field.label === "Publisher")?.value || app.subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <span>{text(locale, "Scopes", "الصلاحيات")}: {app.fields.find((field) => field.label === "Scopes")?.value}</span>
                  <span>{text(locale, "Redirects", "روابط التحويل")}: {app.fields.find((field) => field.label === "Redirect URIs")?.value}</span>
                  <span>{text(locale, "Updated", "آخر تحديث")}: {formatRelative(app.updatedAt, locale)}</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{text(locale, "Review", "مراجعة")}</span>
          </Link>
        ))}
        {rows.length === 0 ? <div className="p-12 text-center text-sm font-black text-zinc-500 dark:text-zinc-400">{text(locale, "No partner apps match this view.", "لا توجد تطبيقات شركاء تطابق هذا العرض.")}</div> : null}
      </div>
      <LoadMore nextHref={nextHref} locale={locale} />
    </Panel>
  );
}

function AuditConsoleList({
  rows,
  locale,
  nextHref,
  query,
  setQuery,
  applySearch,
}: {
  response: AdminListResponse;
  rows: AdminRecordSummary[];
  locale: Locale;
  nextHref: string | null;
  query: string;
  setQuery: (value: string) => void;
  applySearch: () => void;
}) {
  return (
    <Panel className="overflow-hidden bg-zinc-950 p-0 text-zinc-100 dark:bg-black">
      <ListHeader
        locale={locale}
        title={text(locale, "Audit console", "سجل التدقيق")}
        description={text(locale, "Latest events as a compact console. Open a line for full evidence.", "آخر الأحداث كسجل مختصر. افتح السطر لرؤية الأدلة كاملة.")}
        query={query}
        setQuery={setQuery}
        applySearch={applySearch}
        placeholder={text(locale, "Action, actor, organization", "الإجراء أو المنفذ أو المؤسسة")}
        dark
      />
      <div className="font-mono text-xs">
        {rows.map((row) => (
          <Link key={row.id} href={row.href} className="grid gap-2 border-t border-white/10 px-4 py-3 hover:bg-white/[0.05] md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center">
            <time className="text-zinc-500">{new Date(row.updatedAt).toLocaleString(locale === "ar" ? "ar" : "en")}</time>
            <span className="truncate text-zinc-100">{humanizeAction(row.title, locale)}</span>
            <span className="text-zinc-500">{text(locale, "Open", "فتح")}</span>
          </Link>
        ))}
        {rows.length === 0 ? <div className="p-12 text-center text-sm font-black text-zinc-500">{text(locale, "No audit events match this view.", "لا توجد أحداث تدقيق تطابق هذا العرض.")}</div> : null}
      </div>
      <LoadMore nextHref={nextHref} locale={locale} />
    </Panel>
  );
}

function ListHeader({ locale, title, description, query, setQuery, applySearch, placeholder, dark = false }: { locale: Locale; title: string; description: string; query: string; setQuery: (value: string) => void; applySearch: () => void; placeholder: string; dark?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between", dark ? "border-white/10" : "border-zinc-100 dark:border-white/5")}>
      <div>
        <h2 className="text-lg font-black">{title}</h2>
        <p className={cn("mt-1 text-sm font-bold", dark ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400")}>{description}</p>
      </div>
      <div className="flex w-full gap-2 lg:w-[420px]">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch();
            }}
            placeholder={placeholder}
            className={cn("h-10 w-full rounded-full border pe-4 ps-10 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10", dark ? "border-white/10 bg-white/[0.04] text-zinc-100" : "border-zinc-100 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]")}
          />
        </label>
        <button type="button" onClick={applySearch} className={cn("h-10 rounded-full px-4 text-xs font-black uppercase tracking-widest", dark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950")}>
          {text(locale, "Search", "بحث")}
        </button>
      </div>
    </div>
  );
}

function LoadMore({ nextHref, locale }: { nextHref: string | null; locale: Locale }) {
  if (!nextHref) return null;
  return (
    <div className="border-t border-zinc-100 p-4 text-end dark:border-white/5">
      <Link href={nextHref} className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
        {text(locale, "Load more", "تحميل المزيد")}
      </Link>
    </div>
  );
}

function AdminTableRow({ row, locale }: { row: AdminRecordSummary; locale: Locale }) {
  return (
    <Link href={row.href} className="grid min-w-[760px] grid-cols-[1.2fr_0.6fr_1fr_0.4fr] items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0 hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/[0.02]">
      <span>
        <span className="block font-black">{row.title}</span>
        <span className="mt-1 block text-xs font-bold text-zinc-500 dark:text-zinc-400">{row.subtitle}</span>
      </span>
      <StatusBadge value={row.status} />
      <span className="flex flex-wrap gap-2">
        {row.fields.slice(0, 3).map((field) => (
          <span key={`${row.id}-${field.label}`} className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
            {field.label}: {field.secret ? "redacted" : field.value}
          </span>
        ))}
      </span>
      <span className="text-end text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
        {text(locale, "Details", "تفاصيل")}
      </span>
    </Link>
  );
}

export function AdminDetailPage({ detail, locale }: { detail: AdminDetailResponse; locale: Locale }) {
  if (detail.domain === "organizations" && detail.sections.length > 0) {
    return <OrganizationDetailPage detail={detail} locale={locale} />;
  }

  if (detail.domain === "apps" || detail.domain === "oauth-clients") {
    return <PartnerAppDetail detail={detail} locale={locale} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid content-start gap-4">
        <AdminFieldGrid record={detail.record} locale={locale} />
        {detail.notifications.length > 0 ? <AdminNotifications notifications={detail.notifications} locale={locale} /> : null}
        {detail.sections.length > 0 ? <AdminNestedSections sections={detail.sections} locale={locale} /> : null}
        <AdminAuditTimeline events={detail.auditTimeline} locale={locale} />
      </section>
      <section className="grid content-start gap-4">
        {detail.availableActions.length > 0 ? <AdminActionPanel domain={detail.domain} recordId={detail.record.id} actions={detail.availableActions} locale={locale} /> : null}
        {detail.related.length > 0 ? (
          <Panel>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-400">{text(locale, "Related", "مرتبط")}</h2>
            <div className="mt-4 space-y-2">
              {detail.related.map((record) => (
                <Link key={record.id} href={record.href} className="block rounded-2xl border border-zinc-100 bg-zinc-50 p-3 hover:bg-zinc-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
                  <p className="font-black">{record.title}</p>
                  <p className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">{record.subtitle}</p>
                </Link>
              ))}
            </div>
          </Panel>
        ) : null}
      </section>
    </div>
  );
}

function PartnerAppDetail({ detail, locale }: { detail: AdminDetailResponse; locale: Locale }) {
  const logo = detail.record.fields.find((field) => field.label === "Logo")?.value;
  const homepage = detail.record.fields.find((field) => field.label === "Homepage")?.value;
  const publisher = detail.record.fields.find((field) => field.label === "Publisher")?.value ?? detail.record.subtitle;
  const oauthClient = detail.record.fields.find((field) => field.label === "OAuth client")?.value;
  const scopes = detail.record.fields.find((field) => field.label === "Scopes")?.value;
  const redirects = detail.record.fields.find((field) => field.label === "Redirect URIs")?.value;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid content-start gap-4">
        <Panel className="overflow-hidden p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex min-w-0 gap-5">
              <LogoMark name={detail.record.title} imageUrl={logo} index={3} size="lg" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{text(locale, "Partner submission", "طلب شريك")}</p>
                <h2 className="mt-2 truncate text-3xl font-black">{detail.record.title}</h2>
                <p className="mt-2 text-sm font-bold text-zinc-500 dark:text-zinc-400">{publisher}</p>
              </div>
            </div>
            <div className="grid content-start gap-2 text-sm font-bold">
              <InfoLine label={text(locale, "OAuth client", "عميل OAuth")} value={oauthClient} />
              <InfoLine label={text(locale, "Scopes", "الصلاحيات")} value={scopes} />
              <InfoLine label={text(locale, "Redirect URIs", "روابط التحويل")} value={redirects} />
              <InfoLine label={text(locale, "Homepage", "الموقع")} value={isRenderableUrl(homepage) ? homepage : undefined} href={isRenderableUrl(homepage) ? homepage : undefined} />
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-black">{text(locale, "Review evidence", "بيانات المراجعة")}</h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-100 dark:border-white/5 dark:bg-white/5 sm:grid-cols-2">
            {detail.record.fields.filter((field) => !["Logo", "Homepage"].includes(field.label)).map((field, index) => (
              <SafeField key={`${field.label}:${index}:${field.value}`} field={field} locale={locale} />
            ))}
          </div>
        </Panel>

        {detail.notifications.length > 0 ? <AdminNotifications notifications={detail.notifications} locale={locale} /> : null}
        {detail.sections.length > 0 ? <AdminNestedSections sections={detail.sections} locale={locale} /> : null}
        <AdminAuditTimeline events={detail.auditTimeline} locale={locale} />
      </section>
      <section className="grid content-start gap-4">
        {detail.availableActions.length > 0 ? <AdminActionPanel domain={detail.domain} recordId={detail.record.id} actions={detail.availableActions} locale={locale} /> : null}
      </section>
    </div>
  );
}

function InfoLine({ label, value, href }: { label: string; value?: string; href?: string }) {
  const fallback = /[\u0600-\u06FF]/u.test(label) ? "غير محدد" : "Not set";
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-1 block truncate text-blue-600 dark:text-blue-300">{value}</a>
      ) : (
        <p className="mt-1 truncate text-zinc-700 dark:text-zinc-200">{value || fallback}</p>
      )}
    </div>
  );
}

function OrganizationDetailPage({ detail, locale }: { detail: AdminDetailResponse; locale: Locale }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");
  const members = detail.sections.find((section) => section.id === "members");
  const access = detail.sections.find((section) => section.id === "submissions");
  const business = detail.sections.find((section) => section.id === "business");
  const audit = detail.sections.find((section) => section.id === "audit");
  const selectedSection = detail.sections.find((section) => section.id === activeTab);
  const counts = [
    { label: text(locale, "Members", "الأعضاء"), value: members?.rows.length ?? 0, icon: UsersRound },
    { label: text(locale, "Access", "الوصول"), value: access?.rows.length ?? 0, icon: KeyRound },
    { label: text(locale, "Business", "العمل"), value: business?.rows.length ?? 0, icon: Database },
    { label: text(locale, "Updates", "التحديثات"), value: audit?.rows.length ?? 0, icon: CalendarDays },
  ];

  return (
    <div className="grid gap-4">
      <Panel className="overflow-hidden p-0">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 gap-5">
            <LogoMark name={detail.record.title} imageUrl={detail.record.fields.find((field) => field.label === "Logo")?.value} index={0} size="lg" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{text(locale, "Organization profile", "ملف المؤسسة")}</p>
              <h2 className="mt-2 truncate text-3xl font-black tracking-tight">{cleanTitle(detail.record.title, locale)}</h2>
              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
                {text(locale, "Brand, members, operating records, access, and change history in one place.", "الهوية والأعضاء وسجلات العمل والوصول وتاريخ التغييرات في مكان واحد.")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {detail.record.fields.filter((field) => field.label !== "Logo").slice(0, 4).map((field) => (
                  <span key={field.label} className="rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
                    {translateField(locale, field.label)}: {field.value || text(locale, "Not set", "غير محدد")}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {counts.map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <p className="mt-3 text-2xl font-black">{item.value}</p>
                <p className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <AnalyticsStrip counts={counts} locale={locale} />
      </Panel>

      {selectedSection ? (
        <OrganizationSectionPage detail={detail} section={selectedSection} locale={locale} />
      ) : (
        <>
          {detail.notifications.length > 0 ? <AdminNotifications notifications={detail.notifications} locale={locale} /> : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <OrganizationWorkMap detail={detail} sections={[members, business, access, audit].filter(Boolean) as AdminDetailResponse["sections"]} locale={locale} />
            <div className="grid content-start gap-4">
              {audit ? <DeveloperLogPanel events={audit.rows} timeline={detail.auditTimeline} locale={locale} /> : null}
              <AdminAuditTimeline events={detail.auditTimeline.slice(0, 2)} locale={locale} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OrganizationWorkMap({ detail, sections, locale }: { detail: AdminDetailResponse; sections: AdminDetailResponse["sections"]; locale: Locale }) {
  const icons = { members: UsersRound, business: Database, submissions: KeyRound, audit: CalendarDays } as const;
  return (
    <Panel>
      <SectionTitle title={text(locale, "Organization workspace", "مساحة المؤسسة")} description={text(locale, "Open one area to work with paginated records. The overview stays light.", "افتح منطقة واحدة للعمل على سجلاتها بتحميل مرحلي. تبقى النظرة العامة خفيفة.")} />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = icons[section.id as keyof typeof icons] ?? Database;
          return (
            <Link key={section.id} href={`${detail.record.href}?tab=${section.id}`} className="group flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:bg-white dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 dark:bg-white/[0.05] dark:text-blue-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-black">{translateSection(locale, section.id, section.title)}</span>
                <span className="mt-1 block text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{translateSectionDescription(locale, section.id, section.description)}</span>
                <span className="mt-3 block text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
                  {section.rows.length} {text(locale, "records", "سجل")}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function OrganizationSectionPage({ detail, section, locale }: { detail: AdminDetailResponse; section: AdminDetailResponse["sections"][number]; locale: Locale }) {
  const isMembers = section.id === "members";
  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 dark:border-white/5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href={detail.record.href} className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">
            {text(locale, "Back to organization", "العودة للمؤسسة")}
          </Link>
          <h2 className="mt-3 text-2xl font-black">{translateSection(locale, section.id, section.title)}</h2>
          <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">{translateSectionDescription(locale, section.id, section.description)}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-black dark:bg-white/5">{section.rows.length} {text(locale, "loaded", "محمل")}</span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-white/5">
        {section.rows.map((row, index) => (
          <Link key={row.id} href={isMembers ? `${detail.record.href}?tab=members&member=${row.id}` : row.href} className="grid gap-3 p-4 transition hover:bg-zinc-50 dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <span className="flex min-w-0 items-center gap-3">
              {isMembers ? <Avatar name={row.title} index={index} imageUrl={row.fields.find((field) => field.label === "Avatar")?.value} /> : <LogoMark name={row.title} index={index + 5} imageUrl={row.fields.find((field) => field.label === "Logo")?.value} />}
              <span className="min-w-0">
                <span className="block truncate font-black">{isMembers ? displayMemberName(row.title, index, locale) : humanTitle(row.title)}</span>
                <span className="mt-1 block truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">{isMembers ? translateMemberEmail(locale, row.fields.find((field) => field.label === "Email")?.value) : humanTitle(row.subtitle)}</span>
              </span>
            </span>
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{formatRelative(row.updatedAt, locale)}</span>
          </Link>
        ))}
        {section.rows.length === 0 ? <div className="p-10"><EmptyLine locale={locale} /></div> : null}
      </div>
    </Panel>
  );
}

function AnalyticsStrip({ counts, locale }: { counts: Array<{ label: string; value: number }>; locale: Locale }) {
  const total = Math.max(1, counts.reduce((sum, item) => sum + item.value, 0));
  return (
    <div className="border-t border-zinc-100 p-5 dark:border-white/5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{text(locale, "Activity mix", "توزيع النشاط")}</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
        {counts.map((item, index) => (
          <div key={item.label} className={["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-zinc-400"][index]} style={{ width: `${Math.max(6, (item.value / total) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-zinc-500 dark:text-zinc-400">
        {counts.map((item) => <span key={item.label}>{item.label}: {item.value}</span>)}
      </div>
    </div>
  );
}

function MemberCardSection({ section, locale }: { section: AdminDetailResponse["sections"][number]; locale: Locale }) {
  return (
    <Panel>
      <SectionTitle title={text(locale, "Members", "الأعضاء")} description={text(locale, "People connected to work, invites, keys, and partner authorizations.", "الأشخاص المرتبطون بالعمل والدعوات والمفاتيح وتفويضات الشركاء.")} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {section.rows.map((member, index) => (
          <Link key={member.id} href={member.href} className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
            <Avatar name={member.title} index={index} imageUrl={member.fields.find((field) => field.label === "Avatar")?.value} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-black">{displayMemberName(member.title, index, locale)}</span>
              <span className="mt-1 block truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">{translateMemberEmail(locale, member.fields.find((field) => field.label === "Email")?.value)}</span>
            </span>
          </Link>
        ))}
        {section.rows.length === 0 ? <EmptyLine locale={locale} /> : null}
      </div>
    </Panel>
  );
}

function VisualRecordSection({ section, locale }: { section: AdminDetailResponse["sections"][number]; locale: Locale }) {
  return (
    <Panel>
      <SectionTitle title={translateSection(locale, section.id, section.title)} description={translateSectionDescription(locale, section.id, section.description)} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {section.rows.slice(0, 10).map((row, index) => (
          <Link key={row.id} href={row.href} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
            <div className="flex items-start gap-3">
              <BrandMark name={row.title} index={index + 4} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{humanTitle(row.title)}</p>
                <p className="mt-1 truncate text-xs font-bold text-zinc-500 dark:text-zinc-400">{humanTitle(row.subtitle)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <span>{formatRelative(row.updatedAt, locale)}</span>
              <span>{translateRecordStatus(locale, row.status)}</span>
            </div>
          </Link>
        ))}
        {section.rows.length === 0 ? <EmptyLine locale={locale} /> : null}
      </div>
    </Panel>
  );
}

function DeveloperLogPanel({ events, timeline, locale }: { events: AdminRecordSummary[]; timeline: AdminAuditEvent[]; locale: Locale }) {
  const logs = events.length > 0
    ? events.map((event) => ({ id: event.id, action: event.title, summary: event.subtitle, createdAt: event.updatedAt }))
    : timeline.map((event) => ({ id: event.id, action: event.action, summary: event.summary, createdAt: event.createdAt }));
  return (
    <Panel className="bg-zinc-950 text-zinc-100 dark:bg-black">
      <h2 className="text-lg font-black">{text(locale, "Change log", "سجل التغييرات")}</h2>
      <p className="mt-1 text-sm font-bold text-zinc-400">{text(locale, "Console-style latest updates, readable for operators.", "آخر التحديثات بأسلوب قريب من سجلات المطورين لكن بلغة واضحة.")}</p>
      <div className="mt-4 space-y-2 font-mono text-xs">
        {logs.slice(0, 8).map((event) => (
          <Link key={event.id} href={`/audit-logs/${event.id}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]">
            <span className="block text-zinc-500">{new Date(event.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}</span>
            <span className="mt-1 block text-blue-300">{humanizeAction(event.action, locale)}</span>
            <span className="mt-1 block text-zinc-300">{humanSummary(event.summary, locale)}</span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function AdminNotifications({ notifications, locale }: { notifications: AdminDetailResponse["notifications"]; locale: Locale }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">{text(locale, "Notifications", "التنبيهات")}</h2>
          <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
            {text(locale, "New submissions, risk changes, and organization events that need attention.", "الطلبات الجديدة وتغيرات المخاطر وأحداث المؤسسة التي تحتاج متابعة.")}
          </p>
        </div>
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-300" />
      </div>
      <div className="mt-4 divide-y divide-zinc-100 dark:divide-white/5">
        {notifications.map((item) => (
          <Link key={item.id} href={item.href ?? "#"} className="grid gap-1 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{item.title}</p>
              <StatusBadge value={item.tone} />
            </div>
            <p className="text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function AdminNestedSections({ sections, locale }: { sections: AdminDetailResponse["sections"]; locale: Locale }) {
  const sectionCopy: Record<string, { title: string; description: string }> = {
    members: {
      title: text(locale, "Members and access", "الأعضاء والوصول"),
      description: text(locale, "People observed through invites, records, keys, MCP links, and partner authorizations.", "الأشخاص الظاهرون من الدعوات والسجلات والمفاتيح وروابط MCP وتفويضات الشركاء."),
    },
    submissions: {
      title: text(locale, "Partner and access submissions", "طلبات الشركاء والوصول"),
      description: text(locale, "Partner authorizations, organization API keys, and MCP access for this organization.", "تفويضات الشركاء ومفاتيح API واتصالات MCP الخاصة بهذه المؤسسة."),
    },
    business: {
      title: text(locale, "Business data", "بيانات العمل"),
      description: text(locale, "Projects, units, clients, tasks, bookings, and media owned by this organization.", "المشاريع والوحدات والعملاء والمهام والحجوزات والوسائط الخاصة بهذه المؤسسة."),
    },
    audit: {
      title: text(locale, "Audit and register", "التدقيق والسجل"),
      description: text(locale, "Latest organization audit events and updates visible to Super Admin.", "آخر أحداث التدقيق والتحديثات الظاهرة للمدير الأعلى."),
    },
  };
  return (
    <Panel className="p-0">
      <div className="border-b border-zinc-100 p-5 dark:border-white/5">
        <h2 className="text-lg font-black">{text(locale, "Organization workspace", "مساحة عمل المؤسسة")}</h2>
        <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
          {text(locale, "Members, access, business records, bookings, and audit live here instead of crowding the sidebar.", "الأعضاء والوصول والسجلات التجارية والحجوزات والتدقيق هنا بدلاً من ازدحام الشريط الجانبي.")}
        </p>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-white/5">
        {sections.map((section) => (
          <section key={section.id} className="p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-black">{sectionCopy[section.id]?.title ?? section.title}</h3>
                <p className="mt-1 max-w-3xl text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{sectionCopy[section.id]?.description ?? section.description}</p>
              </div>
              <StatusBadge value={section.warnings.length > 0 ? "warning" : "active"} />
            </div>
            {section.warnings.length > 0 ? (
              <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                {section.warnings.join(" ")}
              </p>
            ) : null}
            <div className="mt-4 grid gap-2">
              {section.rows.slice(0, 8).map((row) => (
                <Link key={`${section.id}-${row.id}`} href={row.href} className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <span>
                    <span className="block font-black">{row.title}</span>
                    <span className="mt-1 block text-xs font-bold text-zinc-500 dark:text-zinc-400">{row.subtitle}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusBadge value={row.status} />
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{text(locale, "Open", "فتح")}</span>
                  </span>
                </Link>
              ))}
              {section.rows.length === 0 && section.warnings.length === 0 ? (
                <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-zinc-400">
                  {text(locale, "No records in this section yet.", "لا توجد سجلات في هذا القسم بعد.")}
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </Panel>
  );
}

export function AdminFieldGrid({ record, locale }: { record: AdminRecordSummary; locale: Locale }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-50 text-lg font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            {record.title.trim().charAt(0).toUpperCase() || <Building2 className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black">{text(locale, "Details", "التفاصيل")}</h2>
            <p className="mt-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">{record.subtitle}</p>
          </div>
        </div>
        <StatusBadge value={record.status} />
      </div>
      <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-100 dark:border-white/5 dark:bg-white/5 sm:grid-cols-2">
        {record.fields.map((field) => <SafeField key={field.label} field={field} locale={locale} />)}
      </div>
    </Panel>
  );
}

function SafeField({ field, locale }: { field: AdminRecordSummary["fields"][number]; locale: Locale }) {
  const isAsset = field.label === "Logo" || isImageDataUrl(field.value);
  if (isAsset) {
    return (
      <div className="bg-white p-4 dark:bg-[#0A0A0A]">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{translateField(locale, field.label)}</p>
        {isImageDataUrl(field.value) || isRenderableUrl(field.value) ? (
          <div className="mt-3 flex items-center gap-3">
            <LogoMark name="Asset" imageUrl={field.value} index={2} />
            <p className="text-sm font-black text-zinc-500 dark:text-zinc-400">{text(locale, "Image configured", "الصورة مهيأة")}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm font-black text-zinc-500 dark:text-zinc-400">{text(locale, "Not configured", "غير مهيأ")}</p>
        )}
      </div>
    );
  }
  return (
    <div className="bg-white p-4 dark:bg-[#0A0A0A]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{translateField(locale, field.label)}</p>
      <p className={cn("mt-2 break-words text-sm font-black", field.secret && "font-mono text-amber-600 dark:text-amber-300")}>
        {field.secret ? text(locale, "Redacted server-side", "محجوب من جهة الخادم") : safeFieldValue(field.value, locale)}
      </p>
    </div>
  );
}

export function AdminActionPanel({ domain, recordId, actions, locale }: { domain: string; recordId: string; actions: AdminAction[]; locale: Locale }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: AdminAction) {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch(`/api/admin/${domain}/${recordId}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ actionId: action.id, targetId: recordId, reason }),
      });
      const payload = await response.json().catch(() => null) as { error?: string; auditId?: string; nextState?: string } | null;
      if (!response.ok) {
        setMessage(payload?.error ?? text(locale, "Action failed.", "فشل الإجراء."));
        return;
      }
      setMessage(payload?.nextState ?? text(locale, "Action recorded and audited.", "تم تسجيل الإجراء وتدقيقه."));
      router.refresh();
    });
  }

  return (
    <Panel>
      <h2 className="text-lg font-black">{text(locale, "Control actions", "إجراءات التحكم")}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">
        {text(locale, "Sensitive actions require a reason and produce an audit event.", "الإجراءات الحساسة تتطلب سبباً وتنتج حدث تدقيق.")}
      </p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={text(locale, "Reason for action", "سبب الإجراء")}
        className="mt-4 min-h-24 w-full resize-y rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
      />
      <div className="mt-4 grid gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={isPending || (action.requiresReason && reason.trim().length === 0)}
            onClick={() => run(action)}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-black uppercase tracking-widest transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
              action.tone === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
              action.tone === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
              action.tone === "neutral" && "border border-zinc-100 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
      {message ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-50 p-3 text-xs font-black text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      ) : null}
    </Panel>
  );
}

export function AdminAuditTimeline({ events, locale }: { events: AdminAuditEvent[]; locale: Locale }) {
  return (
    <Panel>
      <h2 className="text-lg font-black">{text(locale, "Audit timeline", "سجل التدقيق")}</h2>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{humanizeAction(event.action, locale)}</p>
              <time className="text-xs font-bold text-zinc-400">{new Date(event.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}</time>
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{humanSummary(event.summary, locale)}</p>
            <p className="mt-2 font-mono text-[11px] font-bold text-zinc-400">{event.actor}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BrandMark({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" | "lg" }) {
  const palettes = [
    "from-blue-600 to-cyan-500",
    "from-emerald-600 to-teal-400",
    "from-zinc-800 to-blue-700",
    "from-amber-500 to-rose-500",
  ];
  const sizeClass = size === "lg" ? "h-24 w-24 rounded-3xl text-3xl" : size === "sm" ? "h-11 w-11 rounded-2xl text-sm" : "h-16 w-16 rounded-2xl text-xl";
  return (
    <div className={cn("flex shrink-0 items-center justify-center bg-gradient-to-br font-black text-white shadow-none", palettes[index % palettes.length], sizeClass)}>
      {initials(name)}
    </div>
  );
}

function LogoMark({ name, imageUrl, index, size = "md" }: { name: string; imageUrl?: string; index: number; size?: "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-24 w-24 rounded-3xl text-3xl" : "h-12 w-12 rounded-2xl text-sm";
  if (imageUrl) {
    return (
      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden border border-zinc-100 bg-white dark:border-white/10 dark:bg-white/[0.03]", sizeClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center border border-zinc-100 bg-white font-black text-zinc-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200", sizeClass)}>
      {initials(name || `Record ${index + 1}`)}
    </span>
  );
}

function OrganizationMeta({ org, locale }: { org: AdminRecordSummary; locale: Locale }) {
  const email = org.fields.find((field) => field.label === "Email")?.value;
  const website = org.fields.find((field) => field.label === "Website")?.value;
  const values = [
    email ? `${translateField(locale, "Email")}: ${email}` : null,
    website ? `${translateField(locale, "Website")}: ${website}` : null,
  ].filter(Boolean);
  if (values.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
      {values.map((value) => <span key={value}>{value}</span>)}
    </div>
  );
}

function Avatar({ name, index, imageUrl }: { name: string; index: number; imageUrl?: string }) {
  return (
    <div className="relative">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-11 w-11 rounded-2xl object-cover" />
      ) : (
        <BrandMark name={displayMemberName(name, index, "en")} index={index + 7} size="sm" />
      )}
      <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-zinc-50 bg-emerald-500 dark:border-[#101010]" />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-zinc-100 bg-white px-2 py-2 dark:border-white/5 dark:bg-white/[0.03]">
      <span className="block truncate text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="mt-1 block truncate text-xs font-black text-zinc-700 dark:text-zinc-200">{value}</span>
    </span>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-1 text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function EmptyLine({ locale }: { locale: Locale }) {
  return (
    <p className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-zinc-400">
      {text(locale, "Nothing here yet.", "لا توجد بيانات هنا بعد.")}
    </p>
  );
}

function initials(value: string) {
  const words = value.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return "Q";
  return words.slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase();
}

function cleanTitle(value: string, locale: Locale) {
  if (value.toLowerCase() === "organization") return text(locale, "Workspace organization", "مؤسسة مساحة العمل");
  return value;
}

function humanTitle(value: string) {
  if (/^[a-z0-9]{16,}$/iu.test(value)) return `Record ${value.slice(-6).toUpperCase()}`;
  return value;
}

function organizationSupportLine(org: AdminRecordSummary, locale: Locale) {
  const email = org.fields.find((field) => field.label === "Email")?.value;
  const website = org.fields.find((field) => field.label === "Website")?.value;
  if (email) return email;
  if (website) return website;
  if (org.subtitle && !/^[a-z0-9]{16,}$/iu.test(org.subtitle)) return org.subtitle;
  return text(locale, "Organization profile incomplete", "ملف المؤسسة غير مكتمل");
}

function displayMemberName(value: string, index: number, locale: Locale) {
  if (/^[a-z0-9]{16,}$/iu.test(value)) return text(locale, `Workspace member ${index + 1}`, `عضو مساحة العمل ${index + 1}`);
  if (/^Workspace member \d+$/u.test(value)) return locale === "ar" ? value.replace("Workspace member", "عضو مساحة العمل") : value;
  return value;
}

function translateMemberEmail(locale: Locale, value: string | undefined) {
  if (!value || value === "Not synced from auth profile") return text(locale, "Email not synced yet", "البريد غير متزامن بعد");
  return value;
}

function formatRelative(value: number, locale: Locale) {
  const days = Math.max(0, Math.floor((Date.now() - value) / 86_400_000));
  if (days === 0) return text(locale, "Today", "اليوم");
  if (days === 1) return text(locale, "Yesterday", "أمس");
  return locale === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
}

function translateField(locale: Locale, label: string) {
  if (locale === "en") return label;
  const map: Record<string, string> = {
    "Organization ID": "معرف المؤسسة",
    Logo: "الشعار",
    Homepage: "الموقع",
    "OAuth client": "عميل OAuth",
    Publisher: "الناشر",
    Scopes: "الصلاحيات",
    "Redirect URIs": "روابط التحويل",
    "Partner reply": "رد الشريك",
    Description: "الوصف",
    "Callback URL": "رابط الاستجابة",
    "Allowed scopes": "الصلاحيات المسموحة",
    Type: "النوع",
    Email: "البريد",
    Website: "الموقع",
  };
  return map[label] ?? label;
}

function translateSection(locale: Locale, id: string, fallback: string) {
  if (locale === "en") return fallback;
  const map: Record<string, string> = {
    submissions: "طلبات الوصول",
    members: "الأعضاء",
    business: "بيانات العمل",
    audit: "السجل والتدقيق",
  };
  return map[id] ?? fallback;
}

function translateSectionDescription(locale: Locale, id: string, fallback: string) {
  if (locale === "en") return fallback;
  const map: Record<string, string> = {
    submissions: "كل ما يفتح باب وصول خارجي أو آلي لهذه المؤسسة.",
    members: "الأشخاص المرتبطون بالعمل والدعوات والمفاتيح وتفويضات الشركاء.",
    business: "سجلات المبيعات والعملاء والوحدات والمهام والحجوزات والوسائط.",
    audit: "آخر تغييرات المؤسسة بلغة واضحة للمتابعة والمراجعة.",
  };
  return map[id] ?? fallback;
}

function translateRecordStatus(locale: Locale, status: string) {
  if (locale === "en") return status.replace(/_/gu, " ");
  const map: Record<string, string> = {
    active: "نشط",
    approved: "معتمد",
    pending: "بانتظار إجراء",
    warning: "يحتاج متابعة",
    danger: "خطر",
    rejected: "مرفوض",
    suspended: "موقوف",
    archived: "مؤرشف",
    muted: "هادئ",
  };
  return map[status] ?? status;
}

function humanizeAction(action: string, locale: Locale) {
  const en: Record<string, string> = {
    "organization.identity.update": "Organization identity updated",
    "organization.profile.update": "Organization profile updated",
    "organization.invite_link.create": "Invite link created",
    "organization.role.create": "Work role created",
    "admin.record.inspect": "Admin opened this record",
    "admin.record.source": "Source checked in Convex",
    "client update": "Client updated",
    "client delete": "Client deleted",
    "client unit link": "Client linked to unit",
    "client unit unlink": "Client unlinked from unit",
    "property media attach": "Property media attached",
    "project media attach": "Project media attached",
    "partnerApp authorize": "Partner app authorized",
    "calendar create": "Calendar event created",
    "calendar delete": "Calendar event deleted",
  };
  const ar: Record<string, string> = {
    "organization.identity.update": "تم تحديث هوية المؤسسة",
    "organization.profile.update": "تم تحديث ملف المؤسسة",
    "organization.invite_link.create": "تم إنشاء رابط دعوة",
    "organization.role.create": "تم إنشاء دور عمل",
    "admin.record.inspect": "فتح المدير هذا السجل",
    "admin.record.source": "تم التحقق من المصدر في Convex",
    "client update": "تم تحديث عميل",
    "client delete": "تم حذف عميل",
    "client unit link": "تم ربط عميل بوحدة",
    "client unit unlink": "تم فصل عميل عن وحدة",
    "property media attach": "تمت إضافة وسائط للعقار",
    "project media attach": "تمت إضافة وسائط للمشروع",
    "partnerApp authorize": "تم تفويض تطبيق شريك",
    "calendar create": "تم إنشاء موعد",
    "calendar delete": "تم حذف موعد",
  };
  const normalized = action.replace(/\./gu, " ");
  return (locale === "ar" ? ar[action] ?? ar[normalized] : en[action] ?? en[normalized]) ?? normalized;
}

function humanSummary(summary: string, locale: Locale) {
  if (locale === "en") return summary.replace(/^Updated organization identity to Organization\.$/u, "The organization identity fields were updated.");
  if (summary === "Record loaded through privileged Convex admin function.") return "تم تحميل السجل عبر وظيفة إدارية محمية في Convex.";
  if (summary.startsWith("Organization scope:")) return "تم ربط هذا الحدث بنطاق المؤسسة الصحيح.";
  if (summary.includes("Updated organization identity")) return "تم تعديل بيانات هوية المؤسسة.";
  if (summary.includes("Updated organization profile")) return "تم تعديل ملف المؤسسة.";
  if (summary.includes("Created invite link")) return "تم إنشاء دعوة لعضو جديد.";
  if (summary.includes("Created work role")) return "تم إنشاء دور عمل داخل المؤسسة.";
  return summary;
}

function applySearch(pathname: string, searchParams: URLSearchParams, router: ReturnType<typeof useRouter>, query: string) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("cursor");
  const normalized = query.trim();
  if (normalized) params.set("search", normalized);
  else params.delete("search");
  const suffix = params.toString();
  router.push(suffix ? `${pathname}?${suffix}` : pathname);
}

function isImageDataUrl(value: string | undefined) {
  return Boolean(value?.startsWith("data:image/"));
}

function isRenderableUrl(value: string | undefined) {
  return Boolean(value && /^https?:\/\//iu.test(value));
}

function safeFieldValue(value: string, locale: Locale) {
  if (isImageDataUrl(value)) return text(locale, "Image configured", "الصورة مهيأة");
  if (value.length > 220) return `${value.slice(0, 120)}...`;
  if (!value) return text(locale, "Not set", "غير محدد");
  if (value === "not set") return text(locale, "Not set", "غير محدد");
  if (value === "not configured") return text(locale, "Not configured", "غير مهيأ");
  if (value === "configured") return text(locale, "Configured", "مهيأ");
  return value;
}
