export type BrandLocale = "en" | "ar";
export type BrandProduct = "workspace" | "partners" | "admin" | "demo" | "marketing" | "platform";
export type BrandRoute = "auth" | "api" | "reviewCallback" | "oauthStart" | "oauthCallback" | "oauthLogout";
export declare const brandIdentity: {
    readonly name: {
        readonly en: "Qentrah";
        readonly ar: "قنطرة";
    };
    readonly legalName: {
        readonly en: "Qentrah Technology Co.";
        readonly ar: "شركة قنطرة التقنية";
    };
    readonly slug: "qentrah";
    readonly packageScope: "@anan";
    readonly envPrefix: "QENTRAH";
    readonly domains: {
        readonly root: "qentrah.sa";
        readonly workspace: "app.qentrah.sa";
        readonly partners: "partners.qentrah.sa";
        readonly email: "hello@qentrah.sa";
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
        readonly auth: "auth/anan";
        readonly api: "anan";
        readonly reviewCallback: "anan-review-callback";
        readonly oauthStart: "api/auth/anan/start";
        readonly oauthCallback: "api/auth/anan/callback";
        readonly oauthLogout: "api/auth/anan/logout";
    };
    readonly legacy: {
        readonly envPrefix: "ANAN";
        readonly themeStorageKey: "anan-theme";
    };
};
export declare function brandLabel(locale?: BrandLocale): "Qentrah" | "قنطرة";
export declare function brandProductName(product: BrandProduct, locale?: BrandLocale): string;
export declare function brandEnvName(key: string): string;
export declare function legacyBrandEnvName(key: string): string;
export declare function brandRouteSlug(route: BrandRoute): "anan" | "auth/anan" | "anan-review-callback" | "api/auth/anan/start" | "api/auth/anan/callback" | "api/auth/anan/logout";
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
