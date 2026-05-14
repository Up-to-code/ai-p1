import {
  Activity,
  Bot,
  Building2,
  CalendarDays,
  FileKey2,
  FolderKanban,
  KeyRound,
  Link2,
  Network,
  Plug,
  ScrollText,
  ShieldCheck,
  UsersRound,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AdminLocale = "en" | "ar";

export type AdminSectionId =
  | "security"
  | "organizations"
  | "users"
  | "apps"
  | "oauth-clients"
  | "partner-connections"
  | "api-keys"
  | "mcp-connections"
  | "webhooks"
  | "ai-activity"
  | "audit-logs"
  | "workspace-data";

export type AdminSection = {
  id: AdminSectionId;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  icon: LucideIcon;
  controls: string[];
  risk: string;
};

export const adminSections: AdminSection[] = [
  {
    id: "security",
    title: "Security overview",
    eyebrow: "Trust boundary",
    description: "Trusted origins, sessions, cookies, service tokens, cache controls, and CSP posture.",
    href: "/security",
    icon: ShieldCheck,
    controls: ["Verify first-party origins", "Review token separation", "Inspect cookie policy", "Confirm no-store responses"],
    risk: "Session theft, origin confusion, service-token compromise",
  },
  {
    id: "organizations",
    title: "Organizations",
    eyebrow: "Tenants",
    description: "Workspace tenant state, owner context, review status, and operational health.",
    href: "/organizations",
    icon: Building2,
    controls: ["View tenant details", "Suspend risky tenant", "Review audit history", "Inspect active integrations"],
    risk: "BOLA/IDOR across organization-scoped data",
  },
  {
    id: "users",
    title: "Users and admins",
    eyebrow: "Identity",
    description: "User sessions, owners, members, and read-only platform-admin source visibility.",
    href: "/users",
    icon: UsersRound,
    controls: ["View users", "Revoke session", "Disable account", "Read admin allowlist"],
    risk: "Privilege escalation. No UI can promote platform admins.",
  },
  {
    id: "apps",
    title: "Partner app review",
    eyebrow: "OAuth review",
    description: "Partner submissions, scopes, redirect URIs, approval state, and callback delivery.",
    href: "/apps",
    icon: Plug,
    controls: ["Approve", "Reject", "Suspend", "Inspect scopes"],
    risk: "Overbroad scopes, malicious redirect URI, callback spoofing",
  },
  {
    id: "oauth-clients",
    title: "OAuth clients",
    eyebrow: "Authorization",
    description: "Client type, redirect policy, allowed scopes, and production access state.",
    href: "/oauth-clients",
    icon: KeyRound,
    controls: ["Suspend client", "Review redirects", "Rotate confidential client", "Inspect consent"],
    risk: "Token leakage, redirect hijack, stale clients",
  },
  {
    id: "partner-connections",
    title: "Partner connections",
    eyebrow: "Consents",
    description: "Organization app authorizations, granted scopes, expiry, and revocation state.",
    href: "/partner-connections",
    icon: Link2,
    controls: ["Revoke connection", "Pause connection", "Inspect granted scopes", "View external refs"],
    risk: "Unauthorized third-party data access",
  },
  {
    id: "api-keys",
    title: "API keys",
    eyebrow: "Machine access",
    description: "Organization API keys, permissions, quota state, usage, rotation, and revocation.",
    href: "/api-keys",
    icon: FileKey2,
    controls: ["Rotate key", "Revoke key", "View last use", "Inspect permissions"],
    risk: "Long-lived key compromise",
  },
  {
    id: "mcp-connections",
    title: "MCP connections",
    eyebrow: "Agent links",
    description: "Remote tool links, scoped permissions, rate use, last use, and revocation state.",
    href: "/mcp-connections",
    icon: Network,
    controls: ["Pause connector", "Rotate secret", "Revoke connector", "Inspect tools"],
    risk: "Prompt/tool abuse, leaked connector URLs",
  },
  {
    id: "webhooks",
    title: "Webhooks",
    eyebrow: "Delivery",
    description: "Endpoints, delivery attempts, failures, signing-secret status, and retry queues.",
    href: "/webhooks",
    icon: Webhook,
    controls: ["Pause endpoint", "Replay delivery", "Inspect errors", "Rotate signing secret"],
    risk: "Webhook spoofing, replay, secret exposure",
  },
  {
    id: "ai-activity",
    title: "AI runs and tools",
    eyebrow: "Automation",
    description: "Agent runs, blocked actions, tool calls, model usage, memories, and risk decisions.",
    href: "/ai-activity",
    icon: Bot,
    controls: ["Inspect run", "Block tool", "Review memory", "Trace policy decision"],
    risk: "Unsafe automation, prompt injection, excessive tool permissions",
  },
  {
    id: "audit-logs",
    title: "Audit logs",
    eyebrow: "Evidence",
    description: "Admin actions, organization events, partner writes, API key events, and MCP activity.",
    href: "/audit-logs",
    icon: ScrollText,
    controls: ["Filter events", "Export evidence", "Review actor", "Trace request id"],
    risk: "Insufficient forensic visibility",
  },
  {
    id: "workspace-data",
    title: "Workspace data",
    eyebrow: "Operations",
    description: "Projects, properties, clients, calendar, tasks, media, and soft-delete review.",
    href: "/workspace-data",
    icon: FolderKanban,
    controls: ["Review records", "Restore soft delete", "Suspend visibility", "Inspect ownership"],
    risk: "Data tampering, accidental destructive writes",
  },
];

export const adminPrimaryNav = [
  { label: "Overview", href: "/", icon: Activity },
  ...adminSections.map((section) => ({
    label: section.title,
    href: section.href,
    icon: section.icon,
  })),
];

const arabicSectionCopy: Record<AdminSectionId, Pick<AdminSection, "title" | "eyebrow" | "description" | "controls" | "risk">> = {
  security: {
    title: "نظرة الأمان",
    eyebrow: "حدود الثقة",
    description: "الأصول الموثوقة، الجلسات، الكوكيز، رموز الخدمة، التخزين المؤقت، وحالة CSP.",
    controls: ["تحقق من أصول الطرف الأول", "راجع فصل الرموز", "افحص سياسة الكوكيز", "أكد تعطيل التخزين المؤقت"],
    risk: "سرقة الجلسات، ارتباك الأصل، اختراق رمز الخدمة",
  },
  organizations: {
    title: "المؤسسات",
    eyebrow: "المستأجرون",
    description: "حالة مؤسسات مساحة العمل، سياق المالك، حالة المراجعة، والصحة التشغيلية.",
    controls: ["عرض تفاصيل المؤسسة", "إيقاف مؤسسة عالية الخطورة", "مراجعة سجل التدقيق", "فحص التكاملات النشطة"],
    risk: "وصول غير مصرح عبر بيانات المؤسسات",
  },
  users: {
    title: "المستخدمون والمديرون",
    eyebrow: "الهوية",
    description: "جلسات المستخدمين، الملاك، الأعضاء، ورؤية مصدر مدير المنصة للقراءة فقط.",
    controls: ["عرض المستخدمين", "إلغاء جلسة", "تعطيل حساب", "قراءة قائمة المديرين"],
    risk: "تصعيد الصلاحيات. لا توجد واجهة لترقية مدير المنصة.",
  },
  apps: {
    title: "مراجعة تطبيقات الشركاء",
    eyebrow: "مراجعة OAuth",
    description: "طلبات الشركاء، الصلاحيات، روابط إعادة التوجيه، حالة الاعتماد، وتسليم callbacks.",
    controls: ["اعتماد", "رفض", "إيقاف", "فحص الصلاحيات"],
    risk: "صلاحيات واسعة، رابط إعادة توجيه خبيث، أو تزوير callback",
  },
  "oauth-clients": {
    title: "عملاء OAuth",
    eyebrow: "التفويض",
    description: "نوع العميل، سياسة إعادة التوجيه، الصلاحيات، وحالة الوصول للإنتاج.",
    controls: ["إيقاف العميل", "مراجعة الروابط", "تدوير العميل السري", "فحص الموافقة"],
    risk: "تسريب الرموز، اختطاف إعادة التوجيه، عملاء قدامى",
  },
  "partner-connections": {
    title: "اتصالات الشركاء",
    eyebrow: "الموافقات",
    description: "تفويضات تطبيقات المؤسسات، الصلاحيات، الانتهاء، وحالة الإلغاء.",
    controls: ["إلغاء الاتصال", "إيقاف الاتصال مؤقتاً", "فحص الصلاحيات", "عرض المراجع الخارجية"],
    risk: "وصول طرف ثالث غير مصرح للبيانات",
  },
  "api-keys": {
    title: "مفاتيح API",
    eyebrow: "وصول الآلات",
    description: "مفاتيح API للمؤسسات، الصلاحيات، الحصص، الاستخدام، التدوير، والإلغاء.",
    controls: ["تدوير المفتاح", "إلغاء المفتاح", "عرض آخر استخدام", "فحص الصلاحيات"],
    risk: "اختراق مفاتيح طويلة العمر",
  },
  "mcp-connections": {
    title: "اتصالات MCP",
    eyebrow: "روابط الوكلاء",
    description: "روابط الأدوات البعيدة، الصلاحيات المحددة، معدل الاستخدام، آخر استخدام، وحالة الإلغاء.",
    controls: ["إيقاف الموصل", "تدوير السر", "إلغاء الموصل", "فحص الأدوات"],
    risk: "إساءة استخدام الأدوات أو تسريب روابط الموصلات",
  },
  webhooks: {
    title: "Webhooks",
    eyebrow: "التسليم",
    description: "النقاط النهائية، محاولات التسليم، الفشل، حالة سر التوقيع، وقوائم إعادة المحاولة.",
    controls: ["إيقاف نقطة نهائية", "إعادة تشغيل التسليم", "فحص الأخطاء", "تدوير سر التوقيع"],
    risk: "تزوير webhook أو إعادة تشغيله أو كشف السر",
  },
  "ai-activity": {
    title: "تشغيلات الذكاء والأدوات",
    eyebrow: "الأتمتة",
    description: "تشغيلات الوكلاء، الإجراءات المحظورة، استدعاءات الأدوات، استخدام النماذج، الذاكرة، وقرارات المخاطر.",
    controls: ["فحص التشغيل", "حظر أداة", "مراجعة الذاكرة", "تتبع قرار السياسة"],
    risk: "أتمتة غير آمنة أو حقن أوامر أو صلاحيات أدوات زائدة",
  },
  "audit-logs": {
    title: "سجلات التدقيق",
    eyebrow: "الأدلة",
    description: "إجراءات الإدارة، أحداث المؤسسات، كتابات الشركاء، أحداث مفاتيح API، ونشاط MCP.",
    controls: ["تصفية الأحداث", "تصدير الأدلة", "مراجعة الفاعل", "تتبع معرف الطلب"],
    risk: "رؤية جنائية غير كافية",
  },
  "workspace-data": {
    title: "بيانات مساحة العمل",
    eyebrow: "العمليات",
    description: "المشاريع، العقارات، العملاء، التقويم، المهام، الوسائط، ومراجعة الحذف الناعم.",
    controls: ["مراجعة السجلات", "استعادة حذف ناعم", "تعليق الظهور", "فحص الملكية"],
    risk: "تلاعب بالبيانات أو عمليات حذف خاطئة",
  },
};

export function getAdminSections(locale: AdminLocale = "en") {
  if (locale === "en") return adminSections;
  return adminSections.map((section) => ({ ...section, ...arabicSectionCopy[section.id] }));
}

export function getAdminPrimaryNav(locale: AdminLocale = "en") {
  const section = (id: AdminSectionId) => getAdminSections(locale).find((candidate) => candidate.id === id)!;
  return [
    { label: locale === "ar" ? "نظرة عامة" : "Overview", href: "/", icon: Activity },
    { label: section("organizations").title, href: "/organizations", icon: Building2 },
    { label: locale === "ar" ? "الشركاء والتطبيقات" : "Partners and apps", href: "/apps", icon: Plug },
    { label: locale === "ar" ? "الأمان والوصول" : "Security and access", href: "/security", icon: ShieldCheck },
    { label: locale === "ar" ? "الأدلة والتدقيق" : "Evidence and audit", href: "/audit-logs", icon: ScrollText },
  ];
}

export function findAdminSection(idOrPath: string, locale: AdminLocale = "en") {
  const normalized = idOrPath.replace(/^\//u, "");
  return getAdminSections(locale).find((section) => section.id === normalized || section.href.replace(/^\//u, "") === normalized);
}

export const workspaceDataFamilies = [
  { label: "Projects", icon: FolderKanban },
  { label: "Properties", icon: Building2 },
  { label: "Clients", icon: UsersRound },
  { label: "Calendar", icon: CalendarDays },
  { label: "Tasks", icon: Activity },
];

export function getWorkspaceDataFamilies(locale: AdminLocale = "en") {
  if (locale === "en") return workspaceDataFamilies;
  return [
    { label: "المشاريع", icon: FolderKanban },
    { label: "العقارات", icon: Building2 },
    { label: "العملاء", icon: UsersRound },
    { label: "التقويم", icon: CalendarDays },
    { label: "المهام", icon: Activity },
  ];
}
