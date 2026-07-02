// Re-export from the canonical component.
// WorkspaceContactPage is a client component (uses useTranslations + form handler).
// No "use client" needed here — Next.js SSR-renders client components on first load.
export { WorkspaceContactPage as default } from "@/components/marketing/workspace-public/contact-page";
