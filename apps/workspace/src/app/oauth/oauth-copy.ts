import type { OAuthLocale } from "./oauth-locale";

const oauthCopy = {
  en: {
    eyebrow: "Partner authorization",
    consentTitle: "Authorize app access",
    consentDescription: "{app} is requesting secure access to {organization}.",
    fallbackOrganization: "your organization",
    fallbackApp: "Partner app",
    authorize: "Authorize",
    deny: "Deny",
    allowAccess: "Allow access",
    cancel: "Cancel",
    copyLink: "Copy link",
    poweredBy: "Qentrah Workspace",
    permissionTitle: "Requested permissions",
    permissionIntro: "{app} would like to",
    trustNote:
      "Qentrah will share only the approved workspace data. You can revoke this connection later.",
    secureExchange: "Secure OAuth exchange",
    connectionError: "Partner connection could not be authorized.",
    consentError: "OAuth consent could not be completed.",
    mcpAppName: "AI agent",
    mcpConsentTitle: "Connect an AI agent",
    mcpConsentDescription:
      "An AI agent is requesting access to {organization} through Qentrah MCP.",
    mcpPermissionIntro: "This agent will be able to",
    mcpTrustNote:
      "The agent receives access only to this workspace and only with the permissions shown above. You can revoke access at any time.",
    mcpShortTrustNote: "Revoke access anytime.",
    connectAgent: "Connect agent",
    chooseTitle: "Choose an organization",
    chooseDescription:
      "Select the workspace that should review and approve this app access request.",
    chooseEyebrow: "Secure connection",
    chooseSecurityTitle: "Your workspace stays in your control",
    chooseSecurityDescription:
      "You will review the requested permissions before access is granted. Nothing is shared until you approve.",
    workspaceLabel: "Available workspaces",
    continueWith: "Continue with {organization}",
    oauthProtected: "Protected by OAuth 2.0",
    loadingOrganizations: "Loading organizations...",
    noOrganizations:
      "Create or join an organization before authorizing this app.",
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
    allowAccess: "السماح بالوصول",
    cancel: "إلغاء",
    copyLink: "نسخ الرابط",
    poweredBy: "مساحة عمل كانترا",
    permissionTitle: "الصلاحيات المطلوبة",
    permissionIntro: "يطلب {app} السماح بما يلي",
    trustNote:
      "ستشارك كانترا بيانات مساحة العمل المعتمدة فقط. يمكنك إلغاء هذا الاتصال لاحقاً.",
    secureExchange: "تبادل OAuth آمن",
    connectionError: "تعذر تفويض اتصال تطبيق الشريك.",
    consentError: "تعذر إكمال تفويض OAuth.",
    mcpAppName: "وكيل ذكاء اصطناعي",
    mcpConsentTitle: "ربط وكيل ذكاء اصطناعي",
    mcpConsentDescription:
      "يطلب وكيل ذكاء اصطناعي الوصول إلى {organization} عبر Qentrah MCP.",
    mcpPermissionIntro: "سيتمكن هذا الوكيل من",
    mcpTrustNote:
      "يحصل الوكيل على وصول إلى مساحة العمل هذه فقط وبالصلاحيات الموضحة أعلاه. يمكنك إلغاء الوصول في أي وقت.",
    mcpShortTrustNote: "يمكنك إلغاء الوصول في أي وقت.",
    connectAgent: "ربط الوكيل",
    chooseTitle: "اختر مساحة العمل",
    chooseDescription:
      "اختر مساحة العمل التي ستراجع طلب وصول هذا التطبيق وتوافق عليه.",
    chooseEyebrow: "اتصال آمن",
    chooseSecurityTitle: "تظل مساحة عملك تحت سيطرتك",
    chooseSecurityDescription:
      "ستراجع الصلاحيات المطلوبة قبل منح الوصول. لن تتم مشاركة أي شيء حتى توافق.",
    workspaceLabel: "مساحات العمل المتاحة",
    continueWith: "المتابعة باستخدام {organization}",
    oauthProtected: "محمي بواسطة OAuth 2.0",
    loadingOrganizations: "جار تحميل مساحات العمل...",
    noOrganizations:
      "أنشئ مساحة عمل أو انضم إلى مساحة عمل قبل تفويض هذا التطبيق.",
    organizationError: "تعذر اختيار مساحة العمل.",
    continueError: "تعذر متابعة تدفق OAuth.",
    selecting: "جار الاختيار",
    choose: "اختيار",
  },
} as const satisfies Record<OAuthLocale, Record<string, string>>;

export function getOAuthCopy(locale: OAuthLocale) {
  return oauthCopy[locale];
}

export function formatTemplate(
  value: string,
  replacements: Record<string, string>,
) {
  return Object.entries(replacements).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, replacement),
    value,
  );
}
