// Canonical about page — delegates to the workspace-public component.
// WorkspaceAboutPage is a client component (uses framer-motion + next-intl hooks)
// but Next.js still SSR-renders it on first load. No "use client" needed here.
export { WorkspaceAboutPage as default } from "@/components/marketing/workspace-public/about-page";
