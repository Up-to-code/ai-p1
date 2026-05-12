import type { OAuthLocale } from "./oauth-locale";

export const oauthCopy = {
  en: {
    eyebrow: "Partner authorization",
    consentTitle: "Authorize partner access",
    consentDescription: "This app is requesting access to {organization}.",
    fallbackOrganization: "your organization",
    authorize: "Authorize",
    deny: "Deny",
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
    consentTitle: "تفويض وصول تطبيق الشريك",
    consentDescription: "هذا التطبيق يطلب الوصول إلى {organization}.",
    fallbackOrganization: "مساحة العمل الخاصة بك",
    authorize: "تفويض",
    deny: "رفض",
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
