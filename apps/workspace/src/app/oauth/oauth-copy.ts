import type { OAuthLocale } from "./oauth-locale";

export const oauthCopy = {
  en: {
    eyebrow: "Partner authorization",
    consentTitle: "Authorize app access",
    consentDescription: "{app} is requesting secure access to {organization}.",
    fallbackOrganization: "your organization",
    fallbackApp: "Partner app",
    authorize: "Authorize",
    deny: "Deny",
    poweredBy: "Qentrah Workspace",
    permissionTitle: "Requested permissions",
    trustNote: "Qentrah will share only the approved workspace data. You can revoke this connection later.",
    secureExchange: "Secure OAuth exchange",
    connectionError: "Partner connection could not be authorized.",
    consentError: "OAuth consent could not be completed.",
    chooseTitle: "Choose an organization",
    loadingOrganizations: "Loading organizations...",
    noOrganizations: "Create or join an organization before authorizing this app.",
    organizationError: "Organization could not be selected.",
    continueError: "OAuth flow could not continue.",
    selecting: "Selecting",
    choose: "Choose",
  },
  ar: {
    eyebrow: "تفويض الشريك",
    consentTitle: "تفويض وصول التطبيق",
    consentDescription: "{app} يطلب وصولاً آمناً إلى {organization}.",
    fallbackOrganization: "مساحة العمل الخاصة بك",
    fallbackApp: "تطبيق الشريك",
    authorize: "تفويض",
    deny: "رفض",
    poweredBy: "مساحة عمل كانترا",
    permissionTitle: "الصلاحيات المطلوبة",
    trustNote: "ستشارك كانترا بيانات مساحة العمل المعتمدة فقط. يمكنك إلغاء هذا الاتصال لاحقاً.",
    secureExchange: "تبادل OAuth آمن",
    connectionError: "تعذر تفويض اتصال تطبيق الشريك.",
    consentError: "تعذر إكمال تفويض OAuth.",
    chooseTitle: "اختر مساحة العمل",
    loadingOrganizations: "جار تحميل مساحات العمل...",
    noOrganizations: "أنشئ مساحة عمل أو انضم إلى مساحة عمل قبل تفويض هذا التطبيق.",
    organizationError: "تعذر اختيار مساحة العمل.",
    continueError: "تعذر متابعة تدفق OAuth.",
    selecting: "جار الاختيار",
    choose: "اختيار",
  },
} as const satisfies Record<OAuthLocale, Record<string, string>>;

export function getOAuthCopy(locale: OAuthLocale) {
  return oauthCopy[locale];
}
