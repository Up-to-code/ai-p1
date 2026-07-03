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
        readonly root: "www.qentrah.com";
        readonly workspace: "app.qentrah.com";
        readonly partners: "partners.qentrah.com";
        readonly admin: "admin.qentrah.com";
        readonly email: "hello@qentrah.com";
    };
    readonly colors: {
        readonly primary: "#111111";
        readonly primaryHover: "#222222";
        readonly primaryPress: "#000000";
        readonly background: "#FAF8F4";
        readonly surface: "#FFFFFF";
        readonly surfaceSecondary: "#F5F2EC";
        readonly border: "#DED8CF";
        readonly borderStrong: "#D5CEC4";
        readonly textPrimary: "#111111";
        readonly textSecondary: "#4D4D4D";
        readonly textMuted: "#787878";
        readonly success: "#5F7768";
        readonly warning: "#B78544";
        readonly danger: "#A55B52";
        readonly info: "#4388FF";
        readonly networkBlue: "#4F80FF";
        readonly agentPurple: "#8A5CFF";
        readonly humanGreen: "#2BB673";
        readonly automationOrange: "#FF9A3D";
        readonly dataCyan: "#00A3FF";
        readonly systemGray: "#5D6570";
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
    readonly "--color-primary": "#111111";
    readonly "--color-primary-hover": "#222222";
    readonly "--color-primary-press": "#000000";
    readonly "--color-background": "#FAF8F4";
    readonly "--color-surface": "#FFFFFF";
    readonly "--color-surface-secondary": "#F5F2EC";
    readonly "--color-border": "#DED8CF";
    readonly "--color-border-strong": "#D5CEC4";
    readonly "--color-text-primary": "#111111";
    readonly "--color-text-secondary": "#4D4D4D";
    readonly "--color-text-muted": "#787878";
    readonly "--color-success": "#5F7768";
    readonly "--color-warning": "#B78544";
    readonly "--color-danger": "#A55B52";
    readonly "--color-info": "#4388FF";
    readonly "--color-network-blue": "#4F80FF";
    readonly "--color-agent-purple": "#8A5CFF";
    readonly "--color-human-green": "#2BB673";
    readonly "--color-automation-orange": "#FF9A3D";
    readonly "--color-data-cyan": "#00A3FF";
    readonly "--color-system-gray": "#5D6570";
};
