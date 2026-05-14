import { cookies } from "next/headers";

export type AdminLocale = "en" | "ar";

export const ADMIN_LOCALE_COOKIE = "qentrah_admin_locale";

export function isAdminLocale(value: unknown): value is AdminLocale {
  return value === "en" || value === "ar";
}

export async function getAdminLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_LOCALE_COOKIE)?.value;
  return isAdminLocale(value) ? value : "en";
}

export function localeDirection(locale: AdminLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const copy = {
  en: {
    brand: "Qentrah",
    admin: "Admin",
    platform: "Platform",
    platformSecurity: "Platform security",
    serverConsole: "Server-side admin console",
    noBrowserSecrets: "No browser secrets",
    trustBoundary: "Trust boundary",
    overview: {
      eyebrow: "Qentrah platform admin",
      title: "Security command center",
      description:
        "Complete internal control for Workspace authorization, partner access, service tokens, audit evidence, and operational data. Admin assignment remains outside the UI.",
      reviewSecurity: "Review security",
      pendingReview: "Pending review",
      partnerApps: "Partner apps",
      approvedClients: "Approved clients",
      oauthAccess: "OAuth access",
      closedReviews: "Closed reviews",
      rejectedOrSuspended: "Rejected or suspended",
      securityAlerts: "Security alerts",
      configChecks: "Config checks",
      apiDisconnected: "Workspace admin API is not connected",
      controlSurfaces: "Control surfaces",
      controlSurfacesDescription: "Full admin map, with unavailable live counts shown as pending backend expansion.",
      attackCoverage: "Attack coverage",
      noReadableSecrets: "No browser-readable secrets.",
      attackCoverageDescription:
        "Admin calls stay server-side, cache is disabled, service tokens are separated by purpose, and platform-admin promotion is operator-controlled only.",
      securityChecks: "Security checks",
      application: "Application",
      publisher: "Publisher",
      status: "Status",
      scopes: "Scopes",
      noSubmissions: "No partner app submissions found.",
      apiExpansionRequired: "API expansion required",
      records: "records",
    },
    detail: {
      backToQueue: "Back to queue",
      notFound: "Partner app was not found.",
      oauthClient: "OAuth client",
      workspaceOauthClientId: "Workspace OAuth client ID",
      partnersAppId: "Partners app ID",
      partnersClientId: "Partners client ID",
      partnerAppUrl: "Partner app URL",
      authorizationLifetime: "Authorization lifetime",
      authorizationLifetimeValue: "14 days",
      notLinked: "Not linked",
      notProvided: "Not provided",
      redirectUris: "Redirect URIs",
      reviewDecision: "Review decision",
      reviewNotes: "Review notes",
      approveApp: "Approve app",
      rejectApp: "Reject app",
      suspendApp: "Suspend app",
    },
    sections: {
      liveDataState: "Live data state",
      controls: "Controls",
      allowedActions: "Allowed actions",
      trust: "Trust",
      server: "Server",
      workspaceApiOnly: "Workspace API only",
      apiUnavailable: "Workspace admin API unavailable",
      primaryRisk: "Primary risk",
      evidenceNote: "Actions on this page must be checked by Workspace domain policies and recorded in immutable audit evidence.",
      securityControls: "Security controls",
      operationalFamilies: "Operational record families",
      fullCrudNote: "Full CRUD must route through Workspace domain APIs with audit records.",
      backendExpansionRequired: "backend expansion required",
      expansionDescription:
        "This surface is wired into the Workspace-style Admin shell and security model. Live CRUD should be added only through Workspace admin APIs with platform-admin checks, no-store responses, redacted secrets, and audit events.",
    },
    language: {
      english: "English",
      arabic: "Arabic",
      switchToEnglish: "Switch to English",
      switchToArabic: "Switch to Arabic",
    },
    status: {
      active: "Active",
      ok: "Ok",
      warning: "Warning",
      danger: "Danger",
      muted: "Muted",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      suspended: "Suspended",
      info: "Info",
    },
  },
  ar: {
    brand: "قنطرة",
    admin: "الإدارة",
    platform: "المنصة",
    platformSecurity: "أمان المنصة",
    serverConsole: "لوحة إدارة من جهة الخادم",
    noBrowserSecrets: "لا أسرار في المتصفح",
    trustBoundary: "حدود الثقة",
    overview: {
      eyebrow: "إدارة منصة قنطرة",
      title: "مركز التحكم الأمني",
      description:
        "تحكم داخلي كامل في تفويض مساحة العمل، ووصول الشركاء، ورموز الخدمة، وأدلة التدقيق، والبيانات التشغيلية. تعيين مدير المنصة يبقى خارج الواجهة.",
      reviewSecurity: "مراجعة الأمان",
      pendingReview: "بانتظار المراجعة",
      partnerApps: "تطبيقات الشركاء",
      approvedClients: "عملاء معتمدون",
      oauthAccess: "وصول OAuth",
      closedReviews: "مراجعات مغلقة",
      rejectedOrSuspended: "مرفوض أو موقوف",
      securityAlerts: "تنبيهات الأمان",
      configChecks: "فحوص الإعداد",
      apiDisconnected: "واجهة إدارة مساحة العمل غير متصلة",
      controlSurfaces: "أسطح التحكم",
      controlSurfacesDescription: "خريطة الإدارة الكاملة، مع إظهار العدادات غير المتاحة كامتداد مطلوب للواجهة الخلفية.",
      attackCoverage: "تغطية الهجمات",
      noReadableSecrets: "لا توجد أسرار قابلة للقراءة في المتصفح.",
      attackCoverageDescription:
        "تبقى طلبات الإدارة من جهة الخادم، والتخزين المؤقت معطل، ورموز الخدمة مفصولة حسب الغرض، وترقية مدير المنصة تحت تحكم المشغل فقط.",
      securityChecks: "فحوص الأمان",
      application: "التطبيق",
      publisher: "الناشر",
      status: "الحالة",
      scopes: "الصلاحيات",
      noSubmissions: "لا توجد طلبات تطبيقات شركاء.",
      apiExpansionRequired: "يتطلب توسيع API",
      records: "سجلات",
    },
    detail: {
      backToQueue: "العودة إلى قائمة المراجعة",
      notFound: "لم يتم العثور على تطبيق الشريك.",
      oauthClient: "عميل OAuth",
      workspaceOauthClientId: "معرف عميل OAuth في مساحة العمل",
      partnersAppId: "معرف تطبيق الشركاء",
      partnersClientId: "معرف عميل الشركاء",
      partnerAppUrl: "رابط تطبيق الشريك",
      authorizationLifetime: "مدة التفويض",
      authorizationLifetimeValue: "14 يوماً",
      notLinked: "غير مرتبط",
      notProvided: "غير متوفر",
      redirectUris: "روابط إعادة التوجيه",
      reviewDecision: "قرار المراجعة",
      reviewNotes: "ملاحظات المراجعة",
      approveApp: "اعتماد التطبيق",
      rejectApp: "رفض التطبيق",
      suspendApp: "إيقاف التطبيق",
    },
    sections: {
      liveDataState: "حالة البيانات الحية",
      controls: "التحكم",
      allowedActions: "الإجراءات المتاحة",
      trust: "الثقة",
      server: "الخادم",
      workspaceApiOnly: "واجهة مساحة العمل فقط",
      apiUnavailable: "واجهة إدارة مساحة العمل غير متاحة",
      primaryRisk: "الخطر الأساسي",
      evidenceNote: "يجب فحص إجراءات هذه الصفحة بسياسات مساحة العمل وتسجيلها كدليل تدقيق غير قابل للتلاعب.",
      securityControls: "ضوابط الأمان",
      operationalFamilies: "مجموعات السجلات التشغيلية",
      fullCrudNote: "يجب أن يمر التحكم الكامل عبر واجهات مساحة العمل مع سجلات تدقيق.",
      backendExpansionRequired: "يتطلب توسيع الواجهة الخلفية",
      expansionDescription:
        "هذا السطح مربوط بغلاف الإدارة ونموذج الأمان. يجب إضافة التحكم الحي فقط عبر واجهات إدارة مساحة العمل مع فحص مدير المنصة، ومنع التخزين، وحجب الأسرار، وتسجيل التدقيق.",
    },
    language: {
      english: "English",
      arabic: "العربية",
      switchToEnglish: "التبديل إلى الإنجليزية",
      switchToArabic: "التبديل إلى العربية",
    },
    status: {
      active: "نشط",
      ok: "سليم",
      warning: "تحذير",
      danger: "خطر",
      muted: "هادئ",
      pending: "قيد الانتظار",
      approved: "معتمد",
      rejected: "مرفوض",
      suspended: "موقوف",
      info: "معلومة",
    },
  },
} as const;

export type AdminCopy = typeof copy.en;

export function statusLabel(locale: AdminLocale, value: string) {
  const normalized = value.toLowerCase().replace(/\s+/gu, "_") as keyof (typeof copy.en.status);
  return copy[locale].status[normalized] ?? value.replace(/_/gu, " ");
}
