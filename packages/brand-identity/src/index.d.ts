export type BrandLocale = "en" | "ar";
export type BrandProduct = "workspace" | "partners" | "admin" | "demo" | "marketing" | "platform";
export type BrandRoute = "auth" | "api" | "oauthStart" | "oauthCallback" | "oauthLogout";
export declare const brandIdentity: {
    readonly name: {
        readonly en: "Qentrah";
        readonly ar: "كانترا";
    };
    readonly legalName: {
        readonly en: "Qentrah Technology Co.";
        readonly ar: "شركة كانترا التقنية";
    };
    readonly slug: "qentrah";
    readonly packageScope: "@qentrah";
    readonly envPrefix: "QENTRAH";
    readonly themeStorageKey: "qentrah-theme";
    readonly domains: {
        readonly root: "qentrah.com";
        readonly workspace: "app.qentrah.com";
        readonly partners: "partners.qentrah.com";
        readonly admin: "admin.qentrah.com";
        readonly email: "hello@qentrah.com";
    };
    readonly colors: {
        readonly primary: "#0b5cff";
        readonly primaryHover: "#084ad6";
        readonly primaryPress: "#063daf";
        readonly background: "#f7f9fc";
        readonly surface: "#ffffff";
        readonly border: "#e4eaf2";
        readonly textPrimary: "#0e1726";
        readonly textSecondary: "#4f5b6b";
        readonly textMuted: "#7b8794";
        readonly success: "#22c55e";
        readonly warning: "#f59e0b";
        readonly danger: "#ef4444";
        readonly draft: "#2d8cff";
    };
    readonly products: {
        readonly workspace: {
            readonly en: "Workspace";
            readonly ar: "مساحة العمل";
        };
        readonly partners: {
            readonly en: "Partners";
            readonly ar: "الشركاء";
        };
        readonly admin: {
            readonly en: "Admin Review";
            readonly ar: "مراجعة الشركاء";
        };
        readonly demo: {
            readonly en: "OAuth Demo";
            readonly ar: "تجربة OAuth";
        };
        readonly marketing: {
            readonly en: "Marketing";
            readonly ar: "الموقع العام";
        };
        readonly platform: {
            readonly en: "Platform";
            readonly ar: "المنصة";
        };
    };
    readonly routes: {
        readonly auth: "auth/qentrah";
        readonly api: "qentrah";
        readonly oauthStart: "api/auth/qentrah/start";
        readonly oauthCallback: "api/auth/qentrah/callback";
        readonly oauthLogout: "api/auth/qentrah/logout";
    };
};
export declare function brandLabel(locale?: BrandLocale): "Qentrah" | "كانترا";
export declare function brandProductName(product: BrandProduct, locale?: BrandLocale): string;
export declare function brandEnvName(key: string): string;
export declare function brandRouteSlug(route: BrandRoute): "qentrah" | "auth/qentrah" | "api/auth/qentrah/start" | "api/auth/qentrah/callback" | "api/auth/qentrah/logout";
export declare function brandRoutePath(route: BrandRoute): string;
export declare function brandDomainUrl(domain: keyof typeof brandIdentity.domains): string;
export declare function readBrandEnv(key: string, env?: Record<string, string | undefined>, fallback?: string): string | undefined;
export declare function brandCssVariables(): {
    readonly "--color-primary": "#0b5cff";
    readonly "--color-primary-hover": "#084ad6";
    readonly "--color-primary-press": "#063daf";
    readonly "--color-background": "#f7f9fc";
    readonly "--color-surface": "#ffffff";
    readonly "--color-border": "#e4eaf2";
    readonly "--color-text-primary": "#0e1726";
    readonly "--color-text-secondary": "#4f5b6b";
    readonly "--color-text-muted": "#7b8794";
    readonly "--color-success": "#22c55e";
    readonly "--color-warning": "#f59e0b";
    readonly "--color-danger": "#ef4444";
    readonly "--color-draft": "#2d8cff";
};
