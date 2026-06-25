export type BrandLocale = "en" | "ar";
export type BrandProduct = "workspace" | "partners" | "admin" | "demo" | "marketing" | "platform";
export type BrandRoute = "auth" | "api" | "oauthStart" | "oauthCallback" | "oauthLogout";

export const brandIdentity = {
  name: {
    en: "Qentrah",
    ar: "كانترا",
  },
  legalName: {
    en: "Qentrah Technology Co.",
    ar: "شركة كانترا التقنية",
  },
  slug: "qentrah",
  packageScope: "@qentrah",
  envPrefix: "QENTRAH",
  themeStorageKey: "qentrah-theme",
  domains: {
    root: "qentrah.com",
    workspace: "app.qentrah.com",
    partners: "partners.qentrah.com",
    admin: "admin.qentrah.com",
    email: "hello@qentrah.com",
  },
  colors: {
    primary: "#111111",
    primaryHover: "#222222",
    primaryPress: "#000000",
    background: "#FAF8F4",
    surface: "#FFFFFF",
    surfaceSecondary: "#F5F2EC",
    border: "#DED8CF",
    divider: "#D5CEC4",
    textPrimary: "#111111",
    textSecondary: "#4D4D4D",
    textMuted: "#787878",
    success: "#5F7768",
    warning: "#B78544",
    danger: "#A55B52",
    info: "#4388FF",
    networkBlue: "#4F80FF",
    agentPurple: "#8A5CFF",
    humanGreen: "#2BB673",
    automationOrange: "#FF9A3D",
    dataCyan: "#00A3FF",
    systemGray: "#5D6570",
  },
  products: {
    workspace: { en: "Workspace", ar: "مساحة العمل" },
    partners: { en: "Partners", ar: "الشركاء" },
    admin: { en: "Admin Review", ar: "مراجعة الشركاء" },
    demo: { en: "OAuth Demo", ar: "تجربة OAuth" },
    marketing: { en: "Marketing", ar: "الموقع العام" },
    platform: { en: "Platform", ar: "المنصة" },
  },
  routes: {
    auth: "auth/qentrah",
    api: "qentrah",
    oauthStart: "api/auth/qentrah/start",
    oauthCallback: "api/auth/qentrah/callback",
    oauthLogout: "api/auth/qentrah/logout",
  },
} as const;

export function brandLabel(locale: BrandLocale = "en") {
  return brandIdentity.name[locale];
}

export function brandProductName(product: BrandProduct, locale: BrandLocale = "en") {
  const brand = brandLabel(locale);
  const productName = brandIdentity.products[product][locale];
  return locale === "ar" ? `${productName} ${brand}` : `${brand} ${productName}`;
}

export function brandEnvName(key: string) {
  return `${brandIdentity.envPrefix}_${key}`;
}

export function brandRouteSlug(route: BrandRoute) {
  return brandIdentity.routes[route];
}

export function brandRoutePath(route: BrandRoute) {
  return `/${brandRouteSlug(route)}`;
}

export function brandDomainUrl(domain: keyof typeof brandIdentity.domains) {
  const value = brandIdentity.domains[domain];
  return domain === "email" ? value : `https://${value}`;
}

export function readBrandEnv(
  key: string,
  env: Record<string, string | undefined> = process.env,
  fallback?: string,
) {
  const canonical = env[brandEnvName(key)]?.trim();
  if (canonical) return canonical;

  return fallback;
}

export function brandCssVariables() {
  const colors = brandIdentity.colors;
  return {
    "--color-primary": colors.primary,
    "--color-primary-hover": colors.primaryHover,
    "--color-primary-press": colors.primaryPress,
    "--color-background": colors.background,
    "--color-surface": colors.surface,
    "--color-surface-secondary": colors.surfaceSecondary,
    "--color-border": colors.border,
    "--color-divider": colors.divider,
    "--color-text-primary": colors.textPrimary,
    "--color-text-secondary": colors.textSecondary,
    "--color-text-muted": colors.textMuted,
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-danger": colors.danger,
    "--color-info": colors.info,
    "--color-network-blue": colors.networkBlue,
    "--color-agent-purple": colors.agentPurple,
    "--color-human-green": colors.humanGreen,
    "--color-automation-orange": colors.automationOrange,
    "--color-data-cyan": colors.dataCyan,
    "--color-system-gray": colors.systemGray,
  } as const;
}
