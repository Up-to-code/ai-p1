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
        primary: "#0b5cff",
        primaryHover: "#084ad6",
        primaryPress: "#063daf",
        background: "#f7f9fc",
        surface: "#ffffff",
        border: "#e4eaf2",
        textPrimary: "#0e1726",
        textSecondary: "#4f5b6b",
        textMuted: "#7b8794",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        draft: "#2d8cff",
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
        reviewCallback: "qentrah-review-callback",
        oauthStart: "api/auth/qentrah/start",
        oauthCallback: "api/auth/qentrah/callback",
        oauthLogout: "api/auth/qentrah/logout",
    },
};
export function brandLabel(locale = "en") {
    return brandIdentity.name[locale];
}
export function brandProductName(product, locale = "en") {
    const brand = brandLabel(locale);
    const productName = brandIdentity.products[product][locale];
    return locale === "ar" ? `${productName} ${brand}` : `${brand} ${productName}`;
}
export function brandEnvName(key) {
    return `${brandIdentity.envPrefix}_${key}`;
}
export function brandRouteSlug(route) {
    return brandIdentity.routes[route];
}
export function brandRoutePath(route) {
    return `/${brandRouteSlug(route)}`;
}
export function brandDomainUrl(domain) {
    const value = brandIdentity.domains[domain];
    return domain === "email" ? value : `https://${value}`;
}
export function readBrandEnv(key, env = process.env, fallback) {
    const canonical = env[brandEnvName(key)]?.trim();
    if (canonical)
        return canonical;
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
        "--color-border": colors.border,
        "--color-text-primary": colors.textPrimary,
        "--color-text-secondary": colors.textSecondary,
        "--color-text-muted": colors.textMuted,
        "--color-success": colors.success,
        "--color-warning": colors.warning,
        "--color-danger": colors.danger,
        "--color-draft": colors.draft,
    };
}
