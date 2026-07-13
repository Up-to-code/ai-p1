export const workspaceAssets = {
  brand: {
    appLogo: "/qwntrah-logo-app.png",
    oauthLogo: "/brand-logo-white.svg",
    favicon: "/favicon.svg",
    icon: "/logo.ico",
    safariMask: "/mask-icon.svg",
  },
  ai: { logo: "/ai/logo.png" },
  application: {
    icon192: "/app-icon-192.png",
    icon512: "/app-icon-512.png",
    icon1024: "/app-icon-1024.png",
    appleTouchIcon: "/apple-touch-icon.png",
    desktopSource: "/logo-dark-mood.svg",
  },
  mcpBrands: {
    chatgpt: "/brands/mcp/chatgpt.svg",
    claude: "/brands/mcp/claude.svg",
    grok: "/brands/mcp/grok.svg",
    openai: "/brands/mcp/openai.svg",
    vscode: "/brands/mcp/vscode.svg",
  },
  docs: { templateCovers: "/images/docs/template-covers.jpg" },
  viewIcons: {
    activity: "/icons/clickup/activity.svg",
    ai: "/icons/clickup/ai-sparkle.svg",
    board: "/icons/clickup/kanban.svg",
    calendar: "/icons/clickup/calendar.svg",
    chart: "/icons/clickup/bar-chart.svg",
    dashboard: "/icons/clickup/home.svg",
    dashboardFilled: "/icons/clickup/bar-chart-filled.svg",
    document: "/icons/clickup/file-text.svg",
    expand: "/icons/clickup/expand-arrows.svg",
    folder: "/icons/clickup/folder.svg",
    form: "/icons/clickup/clipboard-check.svg",
    link: "/icons/clickup/link.svg",
    list: "/icons/clickup/list.svg",
    menu: "/icons/clickup/menu.svg",
    table: "/icons/clickup/table.svg",
    team: "/icons/clickup/user-plus.svg",
    timeline: "/icons/clickup/clock.svg",
  },
  staticFiles: { robots: "/robots.txt" },
} as const;

type NestedAssetPaths<T> = T extends string
  ? T
  : { [K in keyof T]: NestedAssetPaths<T[K]> }[keyof T];

export type WorkspaceAssetPath = NestedAssetPaths<typeof workspaceAssets>;
