import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { brandProductName } from "@qentrah/brand-identity";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: `${brandProductName("partners", "en")} Docs`,
        url: "/",
      }}
      sidebar={{
        tabs: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}
